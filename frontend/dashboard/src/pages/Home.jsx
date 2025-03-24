import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Progress from "../components/TrackProgress";
import ManagerProgress from "../components/ManagerProgress";
import Notifications from "../components/Notification";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/login");
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Dashboard Home</h1>
          <p className="dashboard-role">You are currently logged in as a {user.role}.</p>
        </header>

        {user.role === "employee" ? (
          <Progress employeeId={user._id} />
        ) : (
          <ManagerProgress />
        )}

        <Notifications />
      </div>
    </div>
  );
};

export default Home;