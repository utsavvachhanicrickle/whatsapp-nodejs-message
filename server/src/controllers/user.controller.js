import pkg from "whatsapp-web.js";
import qrcode from "qrcode";

const { Client, LocalAuth } = pkg;
export const clients = {};

export const addUser = async (req, res) => {
  const io = req.app.get("io");

  const { name, phone, socketId } = req.body;

  if (!name || !phone || !socketId) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const sessionId = phone; 

  if (clients[sessionId]) {
    return res.json({ message: "User already exists" });
  }

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: sessionId }),
    puppeteer: {
      headless: false,
      args: ["--no-sandbox"],
    },
  });

  clients[sessionId] = client;

  // 🔥 STEP 1: QR
  client.on("qr", async (qr) => {
    const qrImage = await qrcode.toDataURL(qr);

    io.to(socketId).emit("qr", {
      sessionId,
      qr: qrImage,
    });
  });

  // 🔥 STEP 2: AUTHENTICATED
  client.on("authenticated", () => {
    io.to(socketId).emit("authenticated", { sessionId });
  });

  // 🔥 STEP 3: READY
  client.on("ready", () => {
    io.to(socketId).emit("ready", {
      sessionId,
      message: "WhatsApp Connected",
    });
  });

  // 🔥 STEP 4: DISCONNECTED
  client.on("disconnected", async (reason) => {
    console.log("Client was logged out or disconnected. Reason:", reason);
    delete clients[sessionId];
    try {
      await client.destroy();
    } catch (e) {
      console.log("Error destroying client:", e.message);
    }
    
    // Notify frontend to remove the session so they get the sign-in option again
    io.emit("session-removed", { sessionId });
  });

  // 🔥 STEP 5: AUTH FAILURE
  client.on("auth_failure", async (msg) => {
    console.log("Auth failure:", msg);
    delete clients[sessionId];
    try {
      await client.destroy();
    } catch (e) {
      console.log("Error destroying client on auth failure:", e.message);
    }
    
    // Notify frontend
    io.emit("session-removed", { sessionId });
  });

  try {
    await client.initialize();
  } catch (err) {
    console.log("Error initializing client:", err.message);
    delete clients[sessionId];
    io.emit("session-removed", { sessionId });
  }

  res.json({ message: "Session started", users: { name, phone, socketId } });
};

export const getAllUsers = async (req, res) => {
  res.json({ users: Object.keys(clients) });
};

export const removeUser = async (req, res) => {
  const io = req.app.get("io");

  const { phone, socketId } = req.body;

  const sessionId = phone;

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }

  const client = clients[sessionId];

  if (!client) {
    return res.status(404).json({ error: "Session not found" });
  }

  try {
    // 🔥 Destroy WhatsApp session
    await client.destroy();

    // 🔥 Remove from memory
    delete clients[sessionId];

    // 🔥 Notify frontend
    if (socketId) {
      io.to(socketId).emit("session-removed", { sessionId });
    } else {
      io.emit("session-removed", { sessionId });
    }

    res.json({ success: true, message: "Session removed successfully" });

  } catch (error) {
    console.error("Error removing session:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};