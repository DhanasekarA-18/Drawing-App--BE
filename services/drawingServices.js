const drawing = require("../models/drawing");

const saveDrawing = async (strokes) => {
  return await drawing.create({ strokes });
};

const resetDrawing = async () => {
  return await drawing.deleteMany({});
};

module.exports = { saveDrawing, resetDrawing };
