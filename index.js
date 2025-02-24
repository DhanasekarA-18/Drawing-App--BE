require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["polling", "websocket"],
});

let userSessions = {}; // { userId: socketId }
let userDrawings = {}; // { userId: strokes[] }
let globalDrawing = []; // Stores all strokes permanently

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (!userId) return socket.disconnect();

  userSessions[userId] = socket.id;

  console.log(`User ${userId} connected with socket ID: ${socket.id}`);

  socket.broadcast.emit("user-joined", { userId });

  socket.emit("load-drawing", globalDrawing);

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

  socket.on("reset", () => {
    if (!userDrawings[userId]) return;

    delete userDrawings[userId];

    globalDrawing = globalDrawing.filter((stroke) => stroke.userId !== userId);

    console.log(`Updated globalDrawing after ${userId} reset:`, globalDrawing);

    io.emit("reset-user", {
      userId,
      updatedStrokes: globalDrawing,
    });

    io.to(userSessions[userId]).emit("user-reset", {
      message: "Your canvas was reset successfully!",
      toastType: "success",
    });

    socket.broadcast.emit("user-reset", {
      message: `User ${userId} reset their canvas.`,
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
