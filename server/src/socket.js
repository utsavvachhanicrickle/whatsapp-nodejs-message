import pkg from "whatsapp-web.js";
import qrcode from "qrcode";
import { safeClientCall } from "./utils/whatsappUtils.js";

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
    const { getWhatsappSectionByNumber } = await import("./services/whatsappSection.service.js");
    const section = await getWhatsappSectionByNumber(sessionId);
    
    if (!section) {
      console.error("❌ Sync contacts error: No section record found for number:", sessionId);
      return;
    }

    const userId = section.userId;
    
    // Use safeClientCall with retries
    const contacts = await safeClientCall(client, 'getContacts');
    
    const userContacts = contacts
      .filter((c) => c.isUser && !c.isGroup && c.number && c.id._serialized.endsWith('@c.us') && (c.name) )
      .map((c) => ({
        whatsappId: c.id._serialized,
        lid: c.id.lid || null,
        name: c.name || null,
        pushName: c.pushname || null,
        phoneNumber: c.number,
        userId: userId,
      }));

    if (userContacts.length > 0) {
      const { upsertWhatsappContacts } = await import("./services/contact.service.js");
      await upsertWhatsappContacts(userContacts);
      console.log(`✅ Successfully synced ${userContacts.length} contacts for:`, sessionId);
      io.to(`session_${sessionId}`).emit("contacts-synced", { sessionId, count: userContacts.length });
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
      io.to(`session_${sessionId}`).emit("qr", { qr: lastQR[sessionId], sessionId });
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
  if (client.listeners('message_create').length > 0) {
    console.log(`ℹ️ Listeners already bound for session ${sessionId}, skipping re-bind.`);
    return;
  }

  console.log(`🔗 Binding events for session ${sessionId}`);

  // 🔥 Unified message listener for all incoming and outgoing messages
  client.on("message_create", async (msg) => {
    try {
      // 🚀 BEST SOLUTION: Resolve the actual contact identity (canonical @c.us)
      const contact = await msg.getContact();
      const chat = await msg.getChat();

      // 🔥 FORCE @c.us conversion if still @lid by using the phone number
      let canonicalFrom = contact.id._serialized;
      if (canonicalFrom.includes('@lid') && contact.number) {
        canonicalFrom = `${contact.number}@c.us`;
      }

      let canonicalTo = msg.fromMe ? chat.id._serialized : (client.info?.wid?._serialized || msg.to);
      if (canonicalTo.includes('@lid')) {
        const chatContact = await chat.getContact().catch(() => null);
        if (chatContact && chatContact.number) {
          canonicalTo = `${chatContact.number}@c.us`;
        }
      }

      console.log(`📩 message_create resolved: from=${canonicalFrom}, to=${canonicalTo}, body=${msg.body?.substring(0, 20)}...`);
      
      const { saveMessage } = await import("./services/message.service.js");
      const messageData = {
        sessionId,
        whatsappId: msg.id._serialized,
        from: canonicalFrom, 
        to: canonicalTo,
        body: msg.body,
        type: msg.type,
        fromMe: msg.fromMe,
        timestamp: msg.timestamp,
      };

      
      // Save to database
      const saved = await saveMessage(messageData);
      
      // Notify all clients in the session room if it was a valid message (not filtered)
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


