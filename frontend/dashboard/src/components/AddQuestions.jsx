import { useState } from "react";
import axios from "axios";
import "../styles/AddQuestions.css";

const AddQuestions = ({ videoId }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ questionText: "", options: ["", "", "", ""], correctAnswer: "" });

  if (!user || user.role !== "manager") {
    return <p className="restricted">Only managers can add questions.</p>;
  }

  const handleQuestionChange = (e) => {
    setNewQuestion({ ...newQuestion, questionText: e.target.value });
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  const handleCorrectAnswerChange = (e) => {
    setNewQuestion({ ...newQuestion, correctAnswer: e.target.value });
  };

  const addQuestionToList = () => {
    if (!newQuestion.questionText || !newQuestion.correctAnswer || newQuestion.options.includes("")) {
      alert("Please complete the question and options before adding.");
      return;
    }

    setQuestions([...questions, { ...newQuestion }]);
    setNewQuestion({ questionText: "", options: ["", "", "", ""], correctAnswer: "" });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication error: Please log in again.");
        return;
      }
  
      const user = JSON.parse(localStorage.getItem("user"));
  
      console.log("Sending data:", { videoId, questions, createdBy: user._id }); // ✅ Log `createdBy`
  
      await axios.post(
        "http://localhost:5000/api/questions/add",
        { videoId, questions, createdBy: user._id }, // 🔴 Include `createdBy`
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      alert("Questions added successfully!");
      setQuestions([]);
    } catch (error) {
      console.error("Error adding questions:", error.response);
      alert("Error adding questions: " + (error.response?.data?.message || "Server Error"));
    }
  };
  
  

  return (
    <div className="questions-container">
      <h3>Add MCQ Questions</h3>
      <input type="text" placeholder="Enter Question" value={newQuestion.questionText} onChange={handleQuestionChange} required />
      
      {newQuestion.options.map((option, index) => (
        <input key={index} type="text" placeholder={`Option ${index + 1}`} value={option} onChange={(e) => handleOptionChange(index, e.target.value)} required />
      ))}

      <input type="text" placeholder="Correct Answer" value={newQuestion.correctAnswer} onChange={handleCorrectAnswerChange} required />

      <button onClick={addQuestionToList}>Add Another Question</button>

      {questions.length > 0 && <button onClick={handleSubmit}>Submit All Questions</button>}
    </div>
  );
};

export default AddQuestions;
