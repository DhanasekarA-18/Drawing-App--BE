const express = require("express");
const router = express.Router();
const drawingController = require("../controller/drawingController");

// Save a new drawing
router.post("/save", drawingController.saveDrawing);

// Get the latest saved drawing
router.get("/latest", drawingController.getLatestDrawing);

// Get all drawings
router.get("/all", drawingController.getAllDrawings);

// Delete all drawings (reset)
router.delete("/reset", drawingController.resetDrawings);

module.exports = router;
