const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
  videoTitle: { type: String, required: true },
  completed: { type: Boolean, default: false },
  quizScore: { type: Number },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Progress", progressSchema);