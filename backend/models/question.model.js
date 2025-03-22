const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
  questionText: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

// ✅ Prevent overwriting the model
const Question = mongoose.models.Question || mongoose.model("Question", questionSchema);
module.exports = Question;
