// Backend - server.js (Node.js + Express + Socket.io + MongoDB)
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// const mongoose = require("mongoose");
// const connectDB = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

// // Connect to MongoDB (Reuse connection if exists)
// if (mongoose.connection.readyState === 0) {
//   connectDB();
// }

// Create Server & WebSocket
const server = http.createServer(app);

const io = new Server(server, { cors: { origin: "*" } });

let userDrawings = {}; // Store strokes per user
let globalDrawing = []; // Store all strokes for syncing new users

io.on("connection", async (socket) => {
  console.log(`User ${socket.id} connected`);

  // Notify all other users except the newly connected user
  socket.broadcast.emit("user-joined", { id: socket.id });

  // Send existing global drawing to the new user
  socket.emit("load-drawing", globalDrawing);

  socket.emit("welcome", { message: "Connected successfully!" });

  // Handle user drawing
  socket.on("draw", (data) => {
    if (!userDrawings[socket.id]) {
      userDrawings[socket.id] = [];
    }

    userDrawings[socket.id].push(data);
    globalDrawing.push({ ...data, socketId: socket.id });

    io.emit("draw", data); // Broadcast to all users
  });

  // Reset user-specific drawing
  socket.on("reset", ({ socketId }) => {
    if (userDrawings[socketId]) {
      delete userDrawings[socketId]; // Remove only the strokes of that user
      globalDrawing = globalDrawing.filter(
        (stroke) => stroke.socketId !== socketId
      );
    }

    // Notify all users to update strokes and remove strokes for resetting user
    io.emit("reset-user", { socketId, updatedStrokes: globalDrawing });

    // Notify the user who reset their canvas
    io.to(socketId).emit("user-reset", {
      id: socketId,
      message: "Canvas reset successfully!",
    });

    socket.broadcast.emit("user-reset", {
      id: socketId,
      message: `User ${socketId} reset their canvas.`,
    });
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
    io.emit("user-left", { id: socket.id });
    delete userDrawings[socket.id];
  });
});

// Root route
app.get("/", (req, res) => {
  res.send(`<h1>🔥Drawing APP Running Successfully🔥</h1>`);
});

// Start Server
const PORT = process.env.PORT || 5002;
server
  .listen(PORT, () => console.log(`Server running on port ${PORT}`))
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Trying with port ${PORT + 1}`
      );
      server.listen(PORT + 1);
    } else {
      console.error(err);
    }
  });
