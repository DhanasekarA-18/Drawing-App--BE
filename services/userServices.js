const User = require("../models/User");

const createUser = async (socketId) => {
  return await User.create({ socketId });
};

const updateUserStroke = async (socketId, strokeData) => {
  return await User.updateOne(
    { socketId },
    { $push: { strokes: strokeData }, $set: { color: strokeData.color } }
  );
};

const deleteUser = async (socketId) => {
  return await User.deleteOne({ socketId });
};

module.exports = { createUser, updateUserStroke, deleteUser };
