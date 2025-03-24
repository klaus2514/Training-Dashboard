import { useEffect, useState, useRef } from "react";
import axios from "axios";
import UploadVideo from "../components/UploadVideo";
import Quiz from "../components/Quiz";
import AddQuestions from "../components/AddQuestions";
import { io } from "socket.io-client";
import "../styles/Videos.css";

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [showQuestionForm, setShowQuestionForm] = useState(null);
  const [completedVideos, setCompletedVideos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRefs = useRef({});
  const socketRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/videos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideos(response.data);
    } catch (err) {
      console.error("Failed to fetch videos:", err);
      setError("Failed to load videos. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isVideoOwner = (video) => {
    if (!user || user.role !== "manager") return false;
    const uploadedById = video.uploadedBy?._id?.toString() || video.uploadedBy;
    return uploadedById === userId;
  };

  const handleUploadSuccess = (newVideo) => {
    setVideos((prev) => [...prev, newVideo]);
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/videos/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      socketRef.current.emit("videoDeleted", videoId);
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.message || "Failed to delete video");
      fetchVideos();
    }
  };

  const setupVideoControls = (videoElement) => {
    if (!videoElement) return;

    let lastTime = 0;

    const handleTimeUpdate = () => {
      if (videoElement.currentTime > lastTime + 1) {
        videoElement.currentTime = lastTime;
      } else {
        lastTime = videoElement.currentTime;
      }
    };

    const handleSeeking = () => {
      if (Math.abs(videoElement.currentTime - lastTime) > 1) {
        videoElement.currentTime = lastTime;
      }
    };

    const handleEnded = () => {
      setCompletedVideos((prev) => ({
        ...prev,
        [videoElement.id]: true,
      }));
    };

    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("seeking", handleSeeking);
    videoElement.addEventListener("ended", handleEnded);

    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("seeking", handleSeeking);
      videoElement.removeEventListener("ended", handleEnded);
    };
  };

  useEffect(() => {
    socketRef.current = io("http://localhost:5000", {
      withCredentials: true,
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    fetchVideos();

    socketRef.current.on("videoAdded", (newVideo) => {
      setVideos((prev) => [...prev, newVideo]);
    });

    socketRef.current.on("videoDeleted", (deletedId) => {
      setVideos((prev) => prev.filter((v) => v._id !== deletedId));
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const cleanupFunctions = Object.values(videoRefs.current)
      .filter(Boolean)
      .map(setupVideoControls);

    return () => cleanupFunctions.forEach((fn) => fn && fn());
  }, [videos]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading videos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={fetchVideos} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="videos-page">
      <header className="videos-header">
        <h1 className="videos-title">Training Videos</h1>
        {user?.role === "manager" && (
          <UploadVideo onUploadSuccess={handleUploadSuccess} />
        )}
      </header>

      <main className="videos-main">
        {videos.length > 0 ? (
          <div className="video-grid">
            {videos.map((video) => {
              const owner = isVideoOwner(video);
              const videoRef = videoRefs.current[video._id];

              return (
                <article key={video._id} className="video-card">
                  <div className="video-wrapper">
                    <video
                      controls
                      ref={(el) => {
                        if (el) {
                          videoRefs.current[video._id] = el;
                          el.id = video._id;
                        }
                      }}
                      src={`http://localhost:5000${video.videoUrl}`}
                      className="video-player"
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>

                  <div className="video-details">
                    <h3 className="video-title">{video.title}</h3>
                    <p className="video-category">{video.category || "Uncategorized"}</p>
                  </div>

                  <div className="video-controls">
                    <button
                      onClick={() => (videoRef?.paused ? videoRef.play() : videoRef.pause())}
                      className="control-btn play-btn"
                    >
                      {videoRef?.paused ? "▶ Play" : "⏸ Pause"}
                    </button>

                    {owner && (
                      <>
                        <button
                          onClick={() => handleDelete(video._id)}
                          className="control-btn delete-btn"
                        >
                          🗑 Delete
                        </button>
                        <button
                          onClick={() =>
                            setShowQuestionForm(
                              showQuestionForm === video._id ? null : video._id
                            )
                          }
                          className="control-btn question-btn"
                        >
                          {showQuestionForm === video._id ? "✖ Cancel" : "➕ Questions"}
                        </button>
                      </>
                    )}
                  </div>

                  {owner && showQuestionForm === video._id && (
                    <div className="question-form-container">
                      <AddQuestions videoId={video._id} />
                    </div>
                  )}

                  {user?.role === "employee" && (
                    <div className="quiz-container">
                      {completedVideos[video._id] ? (
                        <Quiz videoId={video._id} />
                      ) : (
                        <p>Complete the video to take the quiz.</p>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📹</div>
            <h3>No Videos Available</h3>
            {user?.role === "manager" && (
              <p>Upload your first training video to get started</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Videos;