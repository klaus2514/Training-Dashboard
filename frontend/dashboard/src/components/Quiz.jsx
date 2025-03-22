import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Quiz.css";

const Quiz = ({ videoId }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/questions/${videoId}`);
        setQuestions(res.data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, [videoId]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (answers[q._id] === q.correctAnswer) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setSubmitted(true);

    // Send score to backend
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/progress/update",
        { videoId, completed: true, quizScore: correctCount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  return (
    <div className="quiz-container">
      <h3>Quiz for this Video</h3>
      {questions.length === 0 ? (
        <p>No quiz available for this video.</p>
      ) : submitted ? (
        <p>Your Score: {score} / {questions.length}</p>
      ) : (
        <>
          {questions.map((q) => (
            <div key={q._id} className="quiz-question">
              <p>{q.questionText}</p>
              {q.options.map((option, index) => (
                <label key={index} className="quiz-option">
                  <input
                    type="radio"
                    name={q._id}
                    value={option}
                    onChange={() => handleAnswerChange(q._id, option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          ))}
          <button onClick={handleSubmit}>Submit Quiz</button>
        </>
      )}
    </div>
  );
};

export default Quiz;
