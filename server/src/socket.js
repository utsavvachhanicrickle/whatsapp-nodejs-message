import pkg from "whatsapp-web.js";
import qrcode from "qrcode";

const { Client, LocalAuth } = pkg;

export const clients = {};
const initializing = {}; // 🔥 prevent duplicate init

// ================= START SESSION =================
export const startWhatsAppSession = async ({ sessionId, socketId, io }) => {
  let client = clients[sessionId];

  // ✅ REUSE EXISTING CLIENT
  if (client) {
    console.log("♻️ Reusing existing session:", sessionId);

    bindClientEvents(client, sessionId, socketId, io);

    // ✅ IMPORTANT: if already logged in → emit ready
    if (client.info) {
      io.to(socketId).emit("ready", { sessionId });
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

  client.on("ready", () => {
    console.log("✅ Ready:", sessionId);

    io.to(socketId).emit("ready", { sessionId });
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
