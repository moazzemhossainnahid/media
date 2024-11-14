const express = require('express');
const MediaController = require('../Controllers/media.controller'); // Updated to MediaController
const uploadMedia = require('../Middleware/uploadMedia'); // Updated to uploadMedia

const router = express.Router();

// Route to add media (images, videos, docs, etc.)
router.post('/add-media', uploadMedia.single("file"), MediaController.addMedia); // Changed field name to "file"

// Route to get all media files
router.get('/', MediaController.getAllMedia);

// Route to delete a specific media file by ID
router.delete('/:id', MediaController.deleteMedia);

module.exports = router;
