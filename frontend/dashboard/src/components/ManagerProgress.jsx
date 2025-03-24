import { useEffect, useState } from "react";
import axios from "axios";
import Progress from "./TrackProgress";
import "../styles/ManagerProgress.css";

const ManagerProgress = () => {
  const [allProgress, setAllProgress] = useState([]);

  useEffect(() => {
    const fetchAllProgress = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/progress/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const groupedProgress = res.data.reduce((acc, progress) => {
          const employeeId = progress.employeeId._id;
          if (!acc[employeeId]) {
            acc[employeeId] = { employeeId, employeeName: progress.employeeId.name, progress: [] };
          }
          acc[employeeId].progress.push(progress);
          return acc;
        }, {});
        setAllProgress(Object.values(groupedProgress));
      } catch (error) {
        console.error("Error fetching all progress:", error);
      }
    };
    fetchAllProgress();
  }, []);

  return (
    <div className="manager-progress-container">
      <h2>All Employee Progress</h2>
      {allProgress.length > 0 ? (
        allProgress.map((employee) => (
          <div key={employee.employeeId} className="employee-progress">
            <h3>Employee: {employee.employeeName}</h3>
            <Progress employeeId={employee.employeeId} />
          </div>
        ))
      ) : (
        <p>No employee progress available.</p>
      )}
    </div>
  );
};

export default ManagerProgress;