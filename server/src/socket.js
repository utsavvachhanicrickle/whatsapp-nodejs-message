import pkg from "whatsapp-web.js";
import qrcode from "qrcode";
import { safeClientCall } from "./utils/whatsappUtils.js";
import fs from "fs";
import path from "path";

const { Client, LocalAuth } = pkg;

export const clients = {};
const initializing = {}; // 🔥 prevent duplicate init
const syncing = {}; // 🔥 prevent duplicate sync
const lastQR = {}; // 🔥 track the last QR code for each session

// ================= SYNC CONTACTS =================
const syncContacts = async (client, sessionId, io) => {
  if (syncing[sessionId]) {
    console.log("ℹ️ Sync already in progress for:", sessionId);
    return;
  }

  syncing[sessionId] = true;
  try {
    console.log("🔄 Syncing contacts for session:", sessionId);

    // Resolve sessionId (number) to UUID userId via whatsapp_sections
    const { getWhatsappSectionByNumber } =
      await import("./services/whatsappSection.service.js");
    const section = await getWhatsappSectionByNumber(sessionId);

    if (!section) {
      console.error(
        "❌ Sync contacts error: No section record found for number:",
        sessionId,
      );
      return;
    }

    const userId = section.userId;

    // Use safeClientCall with retries
    const contacts = await safeClientCall(client, "getContacts");

    const userContacts = contacts
      .filter(
        (c) =>
          c.isUser &&
          !c.isGroup &&
          c.number &&
          c.id._serialized.endsWith("@c.us") &&
          c.name,
      )
      .map((c) => ({
        whatsappId: c.id._serialized,
        lid: c.id.lid || null,
        name: c.name || null,
        pushName: c.pushname || null,
        phoneNumber: c.number,
        userId: userId,
      }));

    if (userContacts.length > 0) {
      const { upsertWhatsappContacts } =
        await import("./services/contact.service.js");
      await upsertWhatsappContacts(userContacts);
      console.log(
        `✅ Successfully synced ${userContacts.length} contacts for:`,
        sessionId,
      );
      io.to(`session_${sessionId}`).emit("contacts-synced", {
        sessionId,
        count: userContacts.length,
      });
    } else {
      console.log("ℹ️ No user contacts found to sync for:", sessionId);
    }
  } catch (err) {
    console.error("❌ Sync contacts error:", err.message);
  } finally {
    syncing[sessionId] = false;
  }
};

// ================= START SESSION =================
export const startWhatsAppSession = async ({ sessionId, socketId, io }) => {
  let client = clients[sessionId];

  // Join room for this session first
  const socket = io.sockets.sockets.get(socketId);
  if (socket) socket.join(`session_${sessionId}`);

  // ✅ REUSE EXISTING CLIENT
  if (client) {
    console.log("♻️ Reusing existing session:", sessionId);

    // If client is already initialized, just re-bind the socket-specific events
    // but don't wipe all listeners if we don't have to.
    // Actually, bindClientEvents handles removeAllListeners which is a bit aggressive but ensures no leaks.
    bindClientEvents(client, sessionId, io);

    // ✅ IMPORTANT: if already logged in and ready → emit ready and sync
    if (client.isReady) {
      io.to(`session_${sessionId}`).emit("ready", { sessionId });
      syncContacts(client, sessionId, io);
    } else if (lastQR[sessionId]) {
      // 🔥 If not ready but we have a QR, send it so the new client can see it immediately
      io.to(`session_${sessionId}`).emit("qr", {
        qr: lastQR[sessionId],
        sessionId,
      });
    }

    return;
  }

  // ❌ prevent duplicate initialize
  if (initializing[sessionId]) {
    console.log("⚠️ Already initializing:", sessionId);
    return;
  }

  initializing[sessionId] = true;

  // ✅ CREATE CLIENT
  client = new Client({
    authStrategy: new LocalAuth({ clientId: sessionId }),
    puppeteer: {
      headless: false,
      protocolTimeout: 300000,
      args: ["--no-sandbox"],
    },
  });

  clients[sessionId] = client;

  bindClientEvents(client, sessionId, io);

  try {
    await client.initialize();
  } catch (err) {
    console.log("❌ Init error:", err.message);
    delete clients[sessionId];
  } finally {
    delete initializing[sessionId];
  }
};

// ================= EVENTS =================
const bindClientEvents = (client, sessionId, io) => {
  // Only remove listeners if we are setting them up for the first time or if we really need to refresh them.
  // To avoid duplicate message_create listeners, we check if one already exists.
  if (client.listeners("message_create").length > 0) {
    console.log(
      `ℹ️ Listeners already bound for session ${sessionId}, skipping re-bind.`,
    );
    return;
  }

  console.log(`🔗 Binding events for session ${sessionId}`);

  // 🔥 Unified message listener for all incoming and outgoing messages
  client.on("message_create", async (msg) => {
    try {
      // 🚀 BEST SOLUTION: Resolve the actual contact identity (canonical @c.us)
      const contact = await msg.getContact();
      const chat = await msg.getChat();

      // console.log(msg);

      if (
        msg.from === "status@broadcast" ||
        msg.type === "e2e_notification" ||
        msg.type === "notification_template" ||
        msg.type === "protocol"
      ) {
        console.log("---------- Status Message ----------");
        return;
      }

      // 🔥 FORCE @c.us conversion if still @lid by using the phone number
      let canonicalFrom = contact.id._serialized;
      if (canonicalFrom.includes("@lid") && contact.number) {
        canonicalFrom = `${contact.number}@c.us`;
      }

      let canonicalTo = msg.fromMe
        ? chat.id._serialized
        : client.info?.wid?._serialized || msg.to;
      if (canonicalTo.includes("@lid")) {
        const chatContact = await chat.getContact().catch(() => null);
        if (chatContact && chatContact.number) {
          canonicalTo = `${chatContact.number}@c.us`;
        }
      }

      if (msg.from.includes("@g.us")) {
        canonicalFrom = msg.from;
      }

      let fromMeData = msg.fromMe ? canonicalTo : canonicalFrom;

      console.log(
        `📩 message_create resolved: from=${canonicalFrom}, to=${canonicalTo}, body=${msg.body?.substring(0, 20)}...`,
      );

      const { saveMessage } = await import("./services/message.service.js");

      // Resolve author for group messages (the actual participant who sent)
      let author = null;
      if (msg.from.includes("@g.us")) {
        author = msg.author || msg._data?.participant || null;
        // Normalize @lid author to @c.us if possible
        if (author?.includes("@lid") && contact.number) {
          author = `${contact.number}@c.us`;
        }
      }

      // Safe rawData: strip circular refs / methods from the live msg object
      const safeRawData = {
        id: msg.id,
        body: msg.body,
        type: msg.type,
        timestamp: msg.timestamp,
        from: msg.from,
        to: msg.to,
        author: msg.author || null,
        fromMe: msg.fromMe,
        hasMedia: msg.hasMedia,
        ack: msg.ack,
        isForwarded: msg.isForwarded,
        isStatus: msg.isStatus,
        isStarred: msg.isStarred,
        hasQuotedMsg: msg.hasQuotedMsg,
        deviceType: msg.deviceType,
        _data: (() => {
          try { return JSON.parse(JSON.stringify(msg._data)); } catch { return null; }
        })(),
      };

      // For media messages, body may contain raw base64 — don't store it as text
      const MEDIA_TYPES = ["image", "video", "document", "audio", "ptt", "sticker"];
      const isMediaType = MEDIA_TYPES.includes(msg.type);
      const bodyForDb = isMediaType && !msg.body?.startsWith("http") && msg.body?.length > 100
        ? "" // don't store base64 blob as body text
        : msg.body;

      const messageData = {
        sessionId,
        whatsappId: msg.id._serialized,
        from: canonicalFrom,
        to: canonicalTo,
        body: bodyForDb,
        chatId: fromMeData,
        type: msg.type,
        fromMe: msg.fromMe,
        timestamp: msg.timestamp,
        author,
        rawData: safeRawData,
      };

      // Save to database
      const saved = await saveMessage(messageData);
      
      // --- MEDIA DOWNLOAD & SAVE ---
      const bodyIsBase64 = isMediaType && msg.body && msg.body.length > 100 && !msg.body.startsWith("http");

      // Determine if we can actually get media data:
      //  PATH 1 — body has base64 (self-sent image from Android)
      //  PATH 2 — hasMedia=true → downloadMedia() works (incoming or web-sent)
      //  PATH 3 — fromMe=false, hasMedia=false → try downloadMedia() (rare, incoming edge case)
      //  SKIP   — fromMe=true, hasMedia=false, body="" → Android outgoing doc/sticker/video
      //           WhatsApp Web does NOT provide decryption keys for these; downloadMedia() → null
      const canFetchMedia =
        bodyIsBase64 ||
        msg.hasMedia ||
        (!msg.fromMe && isMediaType);

      if (saved && isMediaType && canFetchMedia) {
        console.log(`📎 Media [${msg.type}] path=${bodyIsBase64 ? "body-base64" : "download"} id=${msg.id._serialized}`);
        try {
          let media = null;

          if (bodyIsBase64) {
            // ── PATH 1: base64 in body (self-sent image from Android) ──
            const mimetype = msg._data?.mimetype || "image/jpeg";
            media = {
              data: msg.body,
              mimetype,
              filename: msg._data?.filename || null,
            };
            console.log(`📋 Body base64: mimetype=${mimetype}, length=${msg.body.length}`);
          } else {
            // ── PATH 2/3: incoming or web-sent — use downloadMedia() ──
            console.log(`📡 downloadMedia() for type=${msg.type} fromMe=${msg.fromMe}...`);
            media = await Promise.race([
              msg.downloadMedia(),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error("downloadMedia timeout 60s")), 60000)
              ),
            ]);
            if (media) {
              console.log(`📥 Downloaded: mimetype=${media.mimetype}`);
            } else {
              console.warn(`⚠️ downloadMedia() null — skipping media save for ${msg.id._serialized}`);
            }
          }

          if (media && media.data) {
            const folderMap = {
              image: "images",
              video: "videos",
              document: "docs",
              audio: "audio",
              sticker: "stickers",
              ptt: "audio",
            };
            const folder = folderMap[msg.type] || "docs";

            // Safely derive extension
            const rawExt = (media.mimetype || "application/octet-stream")
              .split("/")[1]
              ?.split(";")[0]
              ?.replace(/[^a-zA-Z0-9]/g, "") || "bin";
            const ext = rawExt.length > 10 ? "bin" : rawExt;
            const originalName = media.filename || msg._data?.filename || "";
            const baseName = originalName
              ? originalName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80)
              : `${Date.now()}_${msg.id.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 40)}.${ext}`;

            const localDir = path.join(process.cwd(), "resources", folder);
            const localPath = path.join(localDir, baseName);

            fs.mkdirSync(localDir, { recursive: true });
            const fileBuffer = Buffer.from(media.data, "base64");
            fs.writeFileSync(localPath, fileBuffer);

            const publicUrl = `/resources/${folder}/${baseName}`;
            const fileSize = fileBuffer.length;
            console.log(`💾 File written: ${localPath} (${fileSize} bytes)`);

            if (!saved.masterId) {
              console.error("❌ masterId is null — cannot link media_files");
            } else {
              const { saveMedia } = await import("./services/message.service.js");
              const mediaRecord = await saveMedia({
                masterId: saved.masterId,
                mediaType: msg.type,
                mimeType: media.mimetype,
                publicUrl,
                localPath,
                fileName: baseName,
                fileSize,
              });
              console.log(`✅ media_files saved: ${mediaRecord._id} → ${publicUrl}`);

              messageData.publicUrl = publicUrl;
              messageData.mediaType = msg.type;
              messageData.mimeType = media.mimetype;
              messageData.fileName = baseName;
            }
          } else if (media && !media.data) {
            console.warn(`⚠️ media object exists but data is empty for ${msg.id._serialized}`);
          }
        } catch (mediaErr) {
          console.error(`❌ Media error [${msg.type}]: ${mediaErr.message}`);
        }
      }
      // --- END MEDIA ---


      // Notify all clients in the session room if it was a valid message
      if (saved) {
        console.log(`✅ Message saved: ${msg.id._serialized}`);
        io.to(`session_${sessionId}`).emit("new-message", messageData);
      }
    } catch (err) {
      console.error("❌ Error handling message_create:", err);
    }
  });

  client.on("qr", async (qr) => {
    console.log("📲 QR sent:", sessionId);
    const qrImage = await qrcode.toDataURL(qr);
    lastQR[sessionId] = qrImage; // 🔥 Store the IMAGE data URL
    io.to(`session_${sessionId}`).emit("qr", {
      sessionId,
      qr: qrImage,
    });
  });

  client.on("authenticated", () => {
    console.log("🔐 Authenticated:", sessionId);
    io.to(`session_${sessionId}`).emit("authenticated", { sessionId });
  });

  client.on("ready", async () => {
    client.isReady = true; // 🔥 Set ready flag
    lastQR[sessionId] = null; // 🔥 Clear QR once ready
    console.log("✅ Ready:", sessionId);
    io.to(`session_${sessionId}`).emit("ready", { sessionId });

    // 🔥 Initial sync when transitioning to ready
    await syncContacts(client, sessionId, io);
  });

  client.on("disconnected", async () => {
    client.isReady = false;
    console.log("❌ Disconnected:", sessionId);

    try {
      await client.destroy();
    } catch (err) {
      console.warn("Destroy error:", err.message);
    }

    delete clients[sessionId];
    io.emit("session-removed", { sessionId });
  });

  client.on("auth_failure", async () => {
    client.isReady = false;
    console.log("❌ Auth failure:", sessionId);
    try {
      await client.destroy();
    } catch (err) {}

    delete clients[sessionId];
    io.emit("session-removed", { sessionId });
  });
};
