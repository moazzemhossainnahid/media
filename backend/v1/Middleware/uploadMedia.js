const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "media/uploads/", // Adjust destination as needed
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const uploadMedia = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Allow any file type by removing specific extension checks
    cb(null, true);
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // Limiting file size to 50MB
  }
});

module.exports = uploadMedia;
