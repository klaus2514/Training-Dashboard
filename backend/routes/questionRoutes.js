const express = require("express");
const router = express.Router();
const Question = require("../models/question.model");
const { protect } = require("../middleware/authMiddleware");

// 🔴 Allow Managers to Add Multiple Questions
router.post("/add", protect, async (req, res) => {
    if (req.user.role !== "manager") {
      return res.status(403).json({ message: "Access denied." });
    }
  
    try {
      const { videoId, questions } = req.body;
  
      if (!videoId || !questions.length) {
        return res.status(400).json({ message: "Video ID and questions are required." });
      }
  
      console.log("Received videoId:", videoId);
      console.log("Received questions:", questions);
  
      const newQuestions = questions.map((q) => ({
        ...q,
        videoId,
        createdBy: req.user._id, // 🔴 Assign `createdBy` from logged-in user
      }));
  
      await Question.insertMany(newQuestions);
  
      io.emit("quizUpdated", { videoId, questions: newQuestions });
  
      res.json({ message: "Questions added successfully!" });
    } catch (error) {
      console.error("Error adding questions:", error);
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  });
  
  

module.exports = router;
