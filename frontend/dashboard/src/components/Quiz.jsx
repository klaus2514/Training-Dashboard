import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Videos.css";

const Quiz = ({ videoId }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found. Please log in.");
        }
        const res = await axios.get(`http://localhost:5000/api/questions/video/${videoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuestions(res.data);
        setFetchError(null);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setFetchError(
          error.response?.status === 401
            ? "Unauthorized: Please log in."
            : error.response?.status === 404
            ? "No questions found for this video"
            : error.message || "Failed to fetch questions"
        );
      }
    };

    fetchQuestions();
  }, [videoId]);

  const handleAnswerChange = (questionId, answerIndex) => {
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const handleSubmit = async () => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (answers[q._id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const totalQuestions = questions.length;
    const quizScore = Math.round((correctCount / totalQuestions) * 10); // Scale to 0-10

    setScore(correctCount);
    setSubmitted(true);

    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const videoTitle = document.querySelector(`#video_${videoId} .video-title`)?.textContent || "Unknown Video";
      await axios.post(
        "http://localhost:5000/api/progress/update",
        {
          employeeId: user.id,
          videoId,
          completed: true,
          quizScore,
          videoTitle,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  return (
    <div className="quiz-container">
      <h3>Quiz for this Video</h3>
      {fetchError ? (
        <p style={{ color: "red" }}>{fetchError}</p>
      ) : questions.length === 0 ? (
        <p>No quiz available for this video.</p>
      ) : submitted ? (
        <p>Your Score: {score} / {questions.length}</p>
      ) : (
        <>
          {questions.map((q) => (
            <div key={q._id} className="quiz-question">
              <p>{q.question}</p>
              {q.options.map((option, index) => (
                <label key={index} className="quiz-option">
                  <input
                    type="radio"
                    name={q._id}
                    value={index}
                    onChange={() => handleAnswerChange(q._id, index)}
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