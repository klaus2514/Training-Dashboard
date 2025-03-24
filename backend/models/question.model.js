const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "Question text is required"],
    trim: true,
  },
  options: {
    type: [String],
    required: [true, "Options are required"],
    validate: {
      validator: function (v) {
        return (
          v.length === 4 &&
          v.every((option) => typeof option === "string" && option.trim().length > 0)
        );
      },
      message: "Exactly 4 non-empty options are required",
    },
  },
  correctAnswer: {
    type: Number,
    required: [true, "Correct answer is required"],
    min: 0,
    max: 3,
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Question", questionSchema);