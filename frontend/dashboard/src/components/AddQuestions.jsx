import { useState } from "react";
import axios from "axios";
import "../styles/AddQuestions.css";

const AddQuestions = ({ videoId }) => {
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], correctAnswer: null },
  ]);

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    if (field === "question") {
      updatedQuestions[index][field] = value;
    } else if (field === "correctAnswer") {
      updatedQuestions[index][field] = Number(value); // Store as number
    } else {
      updatedQuestions[index].options[field] = value;
    }
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], correctAnswer: null }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate that all questions have a correct answer selected
      const invalidQuestions = questions.filter(q => q.correctAnswer === null);
      if (invalidQuestions.length > 0) {
        alert("Please select a correct answer for each question.");
        return;
      }

      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/questions/add",
        { videoId, questions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Questions added successfully!");
      setQuestions([{ question: "", options: ["", "", "", ""], correctAnswer: null }]);
    } catch (error) {
      console.error("Error adding questions:", error);
      alert("Failed to add questions: " + (error.response?.data?.message || "Server Error"));
    }
  };

  return (
    <div className="add-questions-container">
      <h3>Add Questions for Video</h3>
      <form onSubmit={handleSubmit}>
        {questions.map((q, index) => (
          <div key={index} className="question-block">
            <input
              type="text"
              placeholder={`Question ${index + 1}`}
              value={q.question}
              onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
              required
            />
            {q.options.map((option, optIndex) => (
              <input
                key={optIndex}
                type="text"
                placeholder={`Option ${optIndex + 1}`}
                value={option}
                onChange={(e) => handleQuestionChange(index, optIndex, e.target.value)}
                required
              />
            ))}
            <select
              value={q.correctAnswer === null ? "" : q.correctAnswer}
              onChange={(e) => handleQuestionChange(index, "correctAnswer", e.target.value)}
              required
            >
              <option value="">Select Correct Answer</option>
              <option value="0">Option 1</option>
              <option value="1">Option 2</option>
              <option value="2">Option 3</option>
              <option value="3">Option 4</option>
            </select>
            {questions.length > 1 && (
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="remove-btn"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addQuestion} className="add-btn">
          Add Another Question
        </button>
        <button type="submit">Submit Questions</button>
      </form>
    </div>
  );
};

export default AddQuestions;