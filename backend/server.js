require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http"); // ✅ Import HTTP module
const { Server } = require("socket.io"); // ✅ Import Socket.io
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const videoRoutes = require("./routes/videoRoutes");
const questionRoutes = require("./routes/questionRoutes");
const progressRoutes = require("./routes/progress.routes");

const app = express();
const server = http.createServer(app); // ✅ Create HTTP server for WebSockets
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // ✅ Allow frontend to connect
    methods: ["GET", "POST"],
  },
});

connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/progress", progressRoutes);

// WebSocket Connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ✅ Notify clients when a new video is uploaded
  socket.on("newVideo", (video) => {
    io.emit("videoAdded", video);
  });

  // ✅ Notify clients when a new quiz is added
  socket.on("newQuiz", (quiz) => {
    io.emit("quizAdded", quiz);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
