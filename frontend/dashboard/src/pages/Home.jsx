import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons"; // Logout Icon
import Notifications from "../components/Notification";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      navigate("/login"); // Redirect to login if no user
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  // 🔴 Logout Function
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <Notifications /> {/* ✅ Real-time notifications */}
      
      {/* Sidebar */}
      <nav className="sidebar">
        <h2 className="sidebar-logo">Training Dashboard</h2>
        <ul className="sidebar-menu">
          <li className="sidebar-item"><a href="/">Dashboard</a></li>
          <li className="sidebar-item"><a href="/videos">Training Videos</a></li>
          <li className="sidebar-item"><a href="/profile">My Profile</a></li>
          {user.role === "manager" && (
            <li className="sidebar-item"><a href="/track-progress">Track Progress</a></li>
          )}
        </ul>

        {/* 🔴 Logout Button */}
        <button className="logout-btn" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} />
        </button>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Welcome, {user.name}</h1>
          <p className="dashboard-role">Your Role: {user.role}</p>
        </header>

        <section className="recent-activity">
          <h3 className="activity-title">Recent Activity</h3>
          <p className="activity-text">You completed: "Product Knowledge Training"</p>
        </section>
      </div>
    </div>
  );
};

export default Home;
