import express from "express";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import { connectionDB } from "../config/db.js";
import apiRoute from "./routes/index.routes.js";
import cookieParser from "cookie-parser";
import { startWhatsAppSession } from "./socket.js";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

app.get("/", (req, res) => {
  res.send("API running !!");
});

app.set("io", io);
app.use("/api", apiRoute);

// Static media files
app.use("/resources", express.static(path.join(process.cwd(), "resources")));

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

connectionDB();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.join(socket.id);
  socket.on("start-session", async ({ sessionId, socketId }) => {
    try {
      await startWhatsAppSession({ sessionId, socketId, io });
    } catch (err) {
      console.log("Start session error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});

process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason:", reason);
  // Prevent nodemon/server crash
});

process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception:", err);
  // Prevent nodemon/server crash
});
