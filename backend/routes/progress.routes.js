const express = require("express");
const Progress = require("../models/progress.model");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/update", protect, async (req, res) => {
  try {
    const { employeeId, videoId, completed, quizScore, videoTitle } = req.body;

    if (req.user.role !== "employee") {
      return res.status(403).json({ message: "Access denied. Only employees can update progress." });
    }

    if (req.user._id.toString() !== employeeId) {
      return res.status(403).json({ message: "You can only update your own progress." });
    }

    let progress = await Progress.findOne({ employeeId, videoId });

    if (!progress) {
      progress = new Progress({ employeeId, videoId, videoTitle, completed, quizScore });
    } else {
      progress.completed = completed || progress.completed;
      if (quizScore !== undefined) progress.quizScore = quizScore;
      progress.updatedAt = Date.now();
    }

    await progress.save();

    const io = req.app.get("socketio");
    if (io) {
      io.emit("progressUpdated", progress);
    }

    res.json({ message: "Progress updated successfully", progress });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

router.get("/:employeeId", protect, async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res.status(403).json({ message: "Access denied. Only employees can view their own progress." });
    }

    if (req.user._id.toString() !== req.params.employeeId) {
      return res.status(403).json({ message: "You can only view your own progress." });
    }

    const progress = await Progress.find({ employeeId: req.params.employeeId })
      .populate("videoId", "title");
    res.json(progress);
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

router.get("/all", protect, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ message: "Access denied. Only managers can view all progress." });
    }

    const progress = await Progress.find()
      .populate("employeeId", "name")
      .populate("videoId", "title");
    res.json(progress);
  } catch (error) {
    console.error("Error fetching all progress:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;