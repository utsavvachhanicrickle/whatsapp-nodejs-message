import pkg from "whatsapp-web.js";
import qrcode from "qrcode";

const { Client, LocalAuth } = pkg;

export const clients = {};

export const startWhatsAppSession = async ({ sessionId, socketId, io }) => {
  let client = clients[sessionId];

  // ✅ IF EXISTS → REUSE CLIENT (DON'T EMIT READY)
  if (client) {
    console.log("Reusing existing session:", sessionId);

    // 🔥 re-bind events to THIS socket
    bindClientEvents(client, sessionId, socketId, io);
    console.log("resuponse done ", sessionId);

    return;
  }

  // ✅ CREATE NEW CLIENT
  client = new Client({
    authStrategy: new LocalAuth({ clientId: sessionId }),
    puppeteer: {
      headless: false,
      args: ["--no-sandbox"],
    },
  });

  clients[sessionId] = client;

  bindClientEvents(client, sessionId, socketId, io);

  try {
    await client.initialize();
  } catch (err) {
    console.log("Init error:", err.message);
    delete clients[sessionId];
  }
};

// 🔥 EVENT BINDING (IMPORTANT)
const bindClientEvents = (client, sessionId, socketId, io) => {
  client.removeAllListeners();

  client.on("qr", async (qr) => {
    const qrImage = await qrcode.toDataURL(qr);

    io.to(socketId).emit("qr", {
      sessionId,
      qr: qrImage,
    });
  });

  client.on("authenticated", () => {
    io.to(socketId).emit("authenticated", { sessionId });
  });

  client.on("ready", () => {
    io.to(socketId).emit("ready", { sessionId });
  });

  client.on("disconnected", async () => {
    delete clients[sessionId];
    await client.destroy();
    io.emit("session-removed", { sessionId });
  });

  client.on("auth_failure", async () => {
    delete clients[sessionId];
    await client.destroy();
    io.emit("session-removed", { sessionId });
  });
};
