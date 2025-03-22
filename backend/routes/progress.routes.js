const express = require("express");
const router = express.Router();
const Progress = require("../models/progress.model");
const { protect } = require("../middleware/authMiddleware");

module.exports = (io) => {
  router.get("/", protect, async (req, res) => {
    if (req.user.role !== "manager") {
      return res.status(403).json({ message: "Access denied." });
    }

    try {
      const progress = await Progress.find().populate("employeeId").populate("videoId");
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  });

  router.post("/update", protect, async (req, res) => {
    try {
      const { employeeId, videoId, completed, quizScore } = req.body;
      let progress = await Progress.findOne({ employeeId, videoId });

      if (!progress) {
        progress = new Progress({ employeeId, videoId, completed, quizScore });
      } else {
        progress.completed = completed || progress.completed;
        if (quizScore !== undefined) progress.quizScore = quizScore;
        progress.updatedAt = Date.now();
      }

      await progress.save();
      io.emit("progressUpdated", progress); // ✅ Notify managers

      res.json({ message: "Progress updated successfully", progress });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  });

  return router;
};
