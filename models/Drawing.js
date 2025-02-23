const mongoose = require("mongoose");

const DrawingSchema = new mongoose.Schema({
  strokes: [{ x: Number, y: Number, color: String, size: Number }],
});

module.exports = mongoose.model("Drawing", DrawingSchema);
