import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "../styles/Notification.css";

const socket = io("http://localhost:5000"); // ✅ Connect to WebSocket

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    socket.on("videoAdded", (video) => {
      setNotifications((prev) => [...prev, `New Video: ${video.title}`]);
    });

    return () => socket.off("videoAdded");
  }, []);

  return (
    <div className="notifications-container">
      {notifications.length > 0 && (
        <div className="notification-box">
          <h4>Notifications</h4>
          {notifications.map((note, index) => (
            <p key={index}>{note}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
