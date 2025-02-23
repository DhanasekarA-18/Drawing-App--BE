const drawingService = require("../services/drawingServices");

const handleDrawing = async (socket, data) => {
  if (data.x && data.y && data.color && data.size) {
    socket.broadcast.emit("draw", data);
  }
};

const handleReset = async (socket) => {
  await drawingService.resetDrawing();
  socket.emit("reset");
};

module.exports = { handleDrawing, handleReset };
