import { useEffect, useState } from "react";
import axios from "axios";
import ReactECharts from "echarts-for-react";
import "../styles/TrackProgress.css";

const Progress = ({ employeeId }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    if (!employeeId) return;

    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`http://localhost:5000/api/progress/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProgressData(res.data);
      } catch (error) {
        console.error("Error fetching progress:", error);
      }
    };

    fetchProgress();
  }, [employeeId]);

  if (!employeeId) return <p>Loading progress...</p>;

  const getChartOption = (score) => ({
    series: [
      {
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 10,
        splitNumber: 10,
        axisLine: {
          lineStyle: {
            width: 8,
            color: [
              [0.3, "#dc3545"],
              [0.7, "#ffc107"],
              [1, "#28a745"],
            ],
          },
        },
        pointer: { width: 5 },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          formatter: "{value}/10",
          fontSize: 16,
          offsetCenter: [0, "60%"],
        },
        data: [{ value: score || 0 }],
      },
    ],
  });

  return (
    <div className="progress-container">
      <h2>Your Training Progress</h2>
      <div className="progress-grid">
        {progressData.length > 0 ? (
          progressData.map((progress, index) => (
            <div key={index} className="progress-card">
              <h3>{progress.videoTitle}</h3>
              <ReactECharts
                option={getChartOption(progress.quizScore)}
                style={{ height: 200, width: "100%" }}
              />
              <p>Status: {progress.completed ? "Completed" : "In Progress"}</p>
            </div>
          ))
        ) : (
          <p>No training progress available.</p>
        )}
      </div>
    </div>
  );
};

export default Progress;