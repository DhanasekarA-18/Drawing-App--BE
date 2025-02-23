const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  socketId: { type: String, required: true },
  color: { type: String, default: "black" },
  strokes: [{ x: Number, y: Number, color: String, size: Number }],
});

module.exports = mongoose.model("User", UserSchema);
