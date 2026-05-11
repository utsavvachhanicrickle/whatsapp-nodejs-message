import pkg from "whatsapp-web.js";
import qrcode from "qrcode";

const { Client, LocalAuth } = pkg;

export const clients = {};
const initializing = {}; // 🔥 prevent duplicate init

// ================= SYNC CONTACTS =================
const syncContacts = async (client, sessionId) => {
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
    const contacts = await client.getContacts();
    
    const userContacts = contacts
      .filter((c) => c.isUser && !c.isGroup && c.number && !c.id._serialized.includes('@lid') && (c.name) )
      .map((c) => ({
        whatsappId: c.id._serialized,
        name: c.name || null,
        pushName: c.pushname || null,
        phoneNumber: c.number,
        userId: userId,
      }));

    if (userContacts.length > 0) {
      const { upsertWhatsappContacts } = await import("./services/contact.service.js");
      await upsertWhatsappContacts(userContacts);
      console.log(`✅ Successfully synced ${userContacts.length} contacts for:`, sessionId);
    } else {
      console.log("ℹ️ No user contacts found to sync for:", sessionId);
    }
  } catch (err) {
    console.error("❌ Sync contacts error:", err.message);
  }
};

// ================= START SESSION =================
export const startWhatsAppSession = async ({ sessionId, socketId, io }) => {
  let client = clients[sessionId];

  // ✅ REUSE EXISTING CLIENT
  if (client) {
    console.log("♻️ Reusing existing session:", sessionId);

    bindClientEvents(client, sessionId, socketId, io);

    // ✅ IMPORTANT: if already logged in → emit ready and sync
    if (client.info) {
      io.to(socketId).emit("ready", { sessionId });
      syncContacts(client, sessionId);
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
      protocolTimeout: 120000,
      args: ["--no-sandbox"],
    },
  });

  clients[sessionId] = client;

  bindClientEvents(client, sessionId, socketId, io);

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
const bindClientEvents = (client, sessionId, socketId, io) => {
  client.removeAllListeners();

  client.on("qr", async (qr) => {
    const qrImage = await qrcode.toDataURL(qr);

    console.log("📲 QR sent:", sessionId);

    io.to(socketId).emit("qr", {
      sessionId,
      qr: qrImage,
    });
  });

  client.on("authenticated", () => {
    console.log("🔐 Authenticated:", sessionId);

    io.to(socketId).emit("authenticated", { sessionId });
  });

  client.on("ready", async () => {
    console.log("✅ Ready:", sessionId);

    io.to(socketId).emit("ready", { sessionId });
    
    // 🔥 Initial sync when transitioning to ready
    await syncContacts(client, sessionId);
  });

  client.on("disconnected", async () => {
    console.log("❌ Disconnected:", sessionId);

    try {
      await client.destroy();
      await client.pupBrowser?.close();
    } catch (err) {
      console.warn("Destroy error:", err.message);
    }

    delete clients[sessionId];

    io.emit("session-removed", { sessionId });
  });

  client.on("auth_failure", async () => {
    console.log("❌ Auth failure:", sessionId);

    try {
      await client.destroy();
      await client.pupBrowser?.close();
    } catch (err) {}

    delete clients[sessionId];

    io.emit("session-removed", { sessionId });
  });
};
