const express = require("express");
const fs = require("fs");
const path = require("path");
const { protect } = require("../middleware/authMiddleware");
const Video = require("../models/video.model");
const upload = require("../middleware/upload"); // Updated path

const router = express.Router();

// Upload Video
router.post("/upload", protect, upload.single("video"), async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ message: "Access denied. Only managers can upload videos." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No video file uploaded." });
    }

    if (!req.body.title) {
      return res.status(400).json({ message: "Video title is required." });
    }

    const video = new Video({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      videoUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user._id,
    });

    await video.save();

    const populatedVideo = await Video.findById(video._id).populate("uploadedBy", "_id name");

    const io = req.app.get("socketio");
    if (io) {
      io.emit("videoAdded", populatedVideo);
    }

    res.json({ message: "Video uploaded successfully", video: populatedVideo });
  } catch (error) {
    console.error("Upload error:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path); // Clean up uploaded file on error
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Get Videos
router.get("/", protect, async (req, res) => {
  try {
    let videos;
    if (req.user.role === "manager") {
      videos = await Video.find({ uploadedBy: req.user._id }).populate("uploadedBy", "_id name");
    } else {
      videos = await Video.find().populate("uploadedBy", "_id name");
    }
    res.json(videos);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Delete Video
router.delete("/:videoId", protect, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ message: "Access denied. Only managers can delete videos." });
    }

    const video = await Video.findById(req.params.videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (video.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete videos you uploaded." });
    }

    const filePath = path.join(__dirname, "../", video.videoUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Video.deleteOne({ _id: req.params.videoId });

    const io = req.app.get("socketio");
    if (io) {
      io.emit("videoDeleted", req.params.videoId);
    }

    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;