import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/Slidebar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Videos from "./pages/Videos";
import VideoPage from "./pages/VideoPage";
import TrackProgress from "./components/TrackProgress";
import Notifications from "./components/Notification";

function App() {
  return (
    <Router>
      <Notifications />
      <Routes>
        {/* Public Routes (without sidebar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes (with sidebar) */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/video/:id" element={<VideoPage />} />
          <Route path="/track-progress" element={<TrackProgress />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;