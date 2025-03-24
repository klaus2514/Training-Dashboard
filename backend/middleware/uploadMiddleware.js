const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Environment Variables
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, "../uploads");
const maxFileSize = process.env.MAX_FILE_SIZE || 100 * 1024 * 1024; // 100MB

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Absolute path
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`; // Unique filename
    cb(null, filename);
  },
});

// File Filter - Allow Only Video Files
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "video/mp4",
    "video/x-matroska", // MKV
    "video/x-msvideo", // AVI
    "video/webm",
    "video/quicktime", // MOV
    "video/x-ms-wmv", // WMV
  ];
  const allowedExtensions = [".mp4", ".mkv", ".avi", ".webm", ".mov", ".wmv"];

  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only video files are allowed!"), false);
  }
};

// Upload Middleware
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxFileSize }, // 100MB limit
});

module.exports = upload;