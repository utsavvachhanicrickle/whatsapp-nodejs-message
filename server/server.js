import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import qrcode from "qrcode";
import pkg from "whatsapp-web.js";

dotenv.config();
const { Client, LocalAuth } = pkg;

const app = express();
const server = http.createServer(app);

// SOCKET.IO SETUP
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(express.json());
app.use(cors());

// MONGOOSE CONNECT
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// STORE CLIENTS
const clients = {};

// SOCKET CONNECTION
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
});

// START WHATSAPP SESSION
app.post("/start", async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId required" });
  }

  if (clients[sessionId]) {
    return res.json({ message: "Session already exists" });
  }

  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  clients[sessionId] = client;

  // QR EVENT
  client.on("qr", async (qr) => {
    console.log("QR RECEIVED");

    const qrImage = await qrcode.toDataURL(qr);

    io.emit("qr", {
      sessionId,
      qr: qrImage,
    });
  });

  // READY EVENT
  client.on("ready", () => {
    console.log("Client Ready:", sessionId);

    io.emit("ready", { sessionId });
  });

  // AUTH EVENT
  client.on("authenticated", () => {
    console.log("Authenticated:", sessionId);
  });

  // DISCONNECT EVENT
  client.on("disconnected", async () => {
    console.log("Disconnected:", sessionId);

    delete clients[sessionId];
    await client.destroy();

    io.emit("disconnected", { sessionId });
  });

  await client.initialize();

  res.json({ message: "Session started", sessionId });
});

// SEND MESSAGE
app.post("/send", async (req, res) => {
  const { sessionId, number, message } = req.body;

  const client = clients[sessionId];

  if (!client) {
    return res.status(400).json({ error: "Client not found" });
  }

  const formatted = number.includes("@c.us") ? number : `91${number}@c.us`;

  try {
    await client.sendMessage(formatted, message);
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// START SERVER
server.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
