import { useEffect, useState } from "react";
import axios from "axios";
import UploadVideo from "../components/UploadVideo";
import Quiz from "../components/Quiz";
import AddQuestions from "../components/AddQuestions"; // ✅ Import Add Questions Form
import { io } from "socket.io-client";
import "../styles/Videos.css";

const socket = io("http://localhost:5000"); // ✅ Connect to WebSocket server

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [completedVideos, setCompletedVideos] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/videos");
        setVideos(res.data);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    fetchVideos();

    // ✅ Listen for new video uploads
    socket.on("videoAdded", (newVideo) => {
      setVideos((prevVideos) => [...prevVideos, newVideo]);
    });

    return () => socket.off("videoAdded");
  }, []);

  // Prevent Skipping & Track Completion
  useEffect(() => {
    document.querySelectorAll("video").forEach((video) => {
      video.lastTime = 0;

      video.addEventListener("timeupdate", (event) => {
        if (video.currentTime > video.lastTime) {
          video.lastTime = video.currentTime;
        } else {
          video.currentTime = video.lastTime; // Prevent skipping
        }

        // ✅ If video is fully watched, mark as completed
        if (video.currentTime >= video.duration - 1) {
          setCompletedVideos((prev) => ({
            ...prev,
            [video.id]: true,
          }));
        }
      });
    });

    return () => {
      document.querySelectorAll("video").forEach((video) => {
        video.removeEventListener("timeupdate", () => {});
      });
    };
  }, []);

  return (
    <div className="videos-container">
      <h2>Training Videos</h2>

      {/* ✅ Show Upload Form for Managers Only */}
      {user && user.role === "manager" && <UploadVideo />}

      <div className="videos-grid">
        {videos.length > 0 ? (
          videos.map((video) => (
            <div key={video._id} className="video-card">
              <video
                controls
                width="100%"
                onContextMenu={(e) => e.preventDefault()}
                id={video._id}
              >
                <source src={`http://localhost:5000${video.videoUrl}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <h3>{video.title}</h3>
              <p>Category: {video.category}</p>

              {/* ✅ Managers Can Add Questions */}
              {user.role === "manager" && <AddQuestions videoId={video._id} />}

              {/* ✅ Show Quiz Only If Video is Completed */}
              {completedVideos[video._id] && <Quiz videoId={video._id} />}
            </div>
          ))
        ) : (
          <p>No training videos available.</p>
        )}
      </div>
    </div>
  );
};

export default Videos;
