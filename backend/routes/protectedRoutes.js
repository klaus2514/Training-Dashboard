const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const Progress = require("../models/progress.model"); // ✅ Correct path

const router = express.Router();

// Example: A route that only authenticated users can access
router.get("/dashboard", protect, (req, res) => {
  res.json({ message: `Welcome, ${req.user.role}!`, user: req.user });
});

module.exports = router;
