const mongoose = require("mongoose");

const fileSchema = mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    fileType: {
      type: String, // e.g., "image", "video", "audio", "document", etc.
      required: true,
    },
    fileSize: {
      type: Number, // Store file size in bytes
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const File = mongoose.model("File", fileSchema);

module.exports = File;
