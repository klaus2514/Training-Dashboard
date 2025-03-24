const express = require("express");
const router = express.Router();
const Question = require("../models/question.model");
const { protect } = require("../middleware/authMiddleware");

router.post("/add", protect, async (req, res) => {
  try {
    const { videoId, questions } = req.body;
    const userId = req.user._id;

    if (!videoId || !questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: "Video ID and questions array are required",
      });
    }

    const questionsToSave = questions.map((question) => ({
      ...question,
      videoId,
      createdBy: userId,
    }));

    const savedQuestions = await Question.insertMany(questionsToSave);

    const io = req.app.get("socketio");
    if (io) {
      io.emit("questionsAdded", {
        videoId,
        questions: savedQuestions,
      });
    }

    res.status(201).json({
      success: true,
      message: "Questions added successfully",
      questions: savedQuestions,
    });
  } catch (error) {
    console.error("Detailed error adding questions:", error); // Improved logging
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.get("/video/:videoId", protect, async (req, res) => {
  try {
    const questions = await Question.find({ videoId: req.params.videoId });
    res.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;