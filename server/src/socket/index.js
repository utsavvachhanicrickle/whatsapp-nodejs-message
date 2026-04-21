import { Server } from "socket.io";

let io;
const users = {}; // store socket connections

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5174",
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // store user
    users[socket.id] = socket.id;

    // listen custom events
    socket.on("join", (data) => {
      console.log("User joined:", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      delete users[socket.id];
    });
  });

  return io;
};

// helper functions
export const getIO = () => io;
export const getUsers = () => users;