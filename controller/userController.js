const userService = require("../services/userServices");

const handleUserConnection = async (socket) => {
  await userService.createUser(socket.id);
  socket.broadcast.emit("user-joined", { id: socket.id });
};

const handleUserDisconnection = async (socket) => {
  await userService.deleteUser(socket.id);
  socket.broadcast.emit("user-disconnected", { id: socket.id });
};

module.exports = { handleUserConnection, handleUserDisconnection };
