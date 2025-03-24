import { useState, useEffect } from "react";
import { useNavigate, Link, Outlet } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faSignInAlt, faBars } from "@fortawesome/free-solid-svg-icons";
import "../styles/slidebar.css";

const DashboardLayout = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(JSON.parse(localStorage.getItem("user")) || null);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard-layout">
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        <FontAwesomeIcon icon={faBars} />
      </button>

      <nav className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <h2 className="sidebar-logo">Navigation</h2>
        <ul className="sidebar-menu">
          <li className="sidebar-item">
            <Link to="/" onClick={toggleSidebar}>Dashboard</Link>
          </li>
          <li className="sidebar-item">
            <Link to="/videos" onClick={toggleSidebar}>Training Videos</Link>
          </li>
          <li className="sidebar-item">
            <Link to="/profile" onClick={toggleSidebar}>My Profile</Link>
          </li>
          {user && user.role === "manager" && (
            <li className="sidebar-item">
              <Link to="/track-progress" onClick={toggleSidebar}>Track Progress</Link>
            </li>
          )}
        </ul>

        <button
          className="auth-btn"
          onClick={user ? handleLogout : handleLogin}
          title={user ? "Logout" : "Login"}
        >
          <FontAwesomeIcon icon={user ? faSignOutAlt : faSignInAlt} />
        </button>
      </nav>

      <div className="main-content">
        {user && (
          <header className="dashboard-header">
            <h1 className="dashboard-title">Welcome, {user.name}</h1>
            <p className="dashboard-role">Your Role: {user.role}</p>
          </header>
        )}
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;