import { useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "../styles/UploadVideo.css";

const socket = io("http://localhost:5000", { transports: ["websocket"] }); // ✅ Ensure WebSocket transport

const UploadVideo = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState(null);

  if (!user || user.role !== "manager") {
    return <p className="upload-restricted">Only managers can upload videos.</p>;
  }

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("title", title);
      formData.append("category", category);

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication error: Please log in again.");
        return;
      }

      const res = await axios.post("http://localhost:5000/api/videos/upload", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      alert("Video uploaded successfully!");
      setTitle("");
      setCategory("");
      setFile(null);

      // ✅ Notify employees about the new video
      socket.emit("newVideo", res.data);
    } catch (error) {
      console.error("Error uploading video:", error.response);
      alert("Error uploading video: " + (error.response?.data?.message || "Server Error"));
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Training Video</h2>
      <form onSubmit={handleUpload} className="upload-form">
        <input type="text" placeholder="Video Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} required />
        <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files[0])} required />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default UploadVideo;
