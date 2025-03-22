const express = require("express");
const multer = require("multer");
const Video = require("../models/video.model");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Configure Multer for video uploads
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// 🔴 Upload Video (Managers Only)
router.post("/upload", protect, upload.single("video"), async (req, res) => {
  if (req.user.role !== "manager") {
    return res.status(403).json({ message: "Only managers can upload videos." });
  }

  try {
    const { title, category } = req.body;
    const videoUrl = `/uploads/${req.file.filename}`;

    const newVideo = await Video.create({ title, category, videoUrl });

    res.status(201).json(newVideo);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// 🔴 Get All Videos
router.get("/", async (req, res) => {
  try {
    const videos = await Video.find();
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
