import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "../styles/TrackProgress.css";

const socket = io("http://localhost:5000"); // ✅ Connect to WebSocket server

const TrackProgress = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "manager") return;

    const fetchProgress = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/progress");
        setProgressData(res.data);
      } catch (error) {
        console.error("Error fetching progress:", error);
      }
    };

    fetchProgress();

    // ✅ Listen for real-time progress updates
    socket.on("progressUpdated", (updatedProgress) => {
      setProgressData((prev) => {
        const index = prev.findIndex((p) => p._id === updatedProgress._id);
        if (index !== -1) {
          prev[index] = updatedProgress;
          return [...prev];
        }
        return [...prev, updatedProgress];
      });
    });

    return () => socket.off("progressUpdated");
  }, [user]);

  if (!user || user.role !== "manager") {
    return <p className="restricted">Only managers can track progress.</p>;
  }

  return (
    <div className="progress-container">
      <h2>Employee Training Progress</h2>
      <table className="progress-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Video Title</th>
            <th>Quiz Score</th>
          </tr>
        </thead>
        <tbody>
          {progressData.map((p) => (
            <tr key={p._id}>
              <td>{p.employeeId.name}</td>
              <td>{p.videoId.title}</td>
              <td>{p.quizScore} / 10</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrackProgress;
