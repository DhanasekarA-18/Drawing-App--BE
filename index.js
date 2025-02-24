require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let userSessions = {}; // { userId: socketId }
let userDrawings = {}; // { userId: strokes[] }
let globalDrawing = []; // Stores all strokes

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (!userId) return socket.disconnect();

  userSessions[userId] = socket.id;

  console.log(`User ${userId} connected with socket ID: ${socket.id}`);

  // Notify all users that a new user has joined
  socket.broadcast.emit("user-joined", { userId });

  // Send existing strokes to the new user
  if (userDrawings[userId]) {
    socket.emit("load-drawing", userDrawings[userId]);
  }

  socket.on("draw", (dataBatch) => {
    if (!userDrawings[userId]) {
      userDrawings[userId] = [];
    }

    dataBatch.forEach((data) => {
      userDrawings[userId].push(data);
      globalDrawing.push({ ...data, userId });
    });

    io.emit("draw", dataBatch);
  });

  // ✅ Fix for Reset Functionality
  socket.on("reset", ({ userId: resetUserId }) => {
    console.log(`Reset requested by user ${resetUserId}`);

    if (userDrawings[resetUserId]) {
      delete userDrawings[resetUserId]; // Remove user's strokes
    }

    // Remove user's strokes from globalDrawing
    globalDrawing = globalDrawing.filter(
      (stroke) => stroke.userId !== resetUserId
    );
    console.log("Updated globalDrawing:", globalDrawing);

    // Notify all users
    io.emit("reset-user", {
      userId: resetUserId,
      updatedStrokes: [...globalDrawing],
    });

    // Notify only the user who reset
    io.to(userSessions[resetUserId]).emit("user-reset", {
      userId: resetUserId,
      message: "Canvas reset successfully!",
      toastType: "success",
    });

    // Notify others
    socket.broadcast.emit("user-reset", {
      userId: resetUserId,
      message: `User ${resetUserId} reset their canvas.`,
    });
  });

  socket.on("disconnect", () => {
    console.log(`User ${userId} disconnected`);
    delete userSessions[userId];
    io.emit("user-left", { userId });
  });
});

// Root route
app.get("/", (req, res) => {
  res.send(`<h1>🔥 Real-Time Drawing App Running Successfully 🔥</h1>`);
});

// Start Server
const PORT = process.env.PORT || 5002;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
