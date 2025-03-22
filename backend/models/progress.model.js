const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
  completed: { type: Boolean, default: false },
  quizScore: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

// ✅ Prevent overwriting the model
const Progress = mongoose.models.Progress || mongoose.model("Progress", progressSchema);
module.exports = Progress;
