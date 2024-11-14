const express = require("express");
const File = require('../Models/media.model'); // Assuming the model is named File
const fs = require('fs');
const path = require("path");
require('dotenv').config();

// Add a media file
exports.addMedia = async (req, res) => {
    try {
        const data = req.body;

        if (req.file) {
            data.filename = req.file.filename;
            data.path = `${process.env.ROOT}/media/${req.file.filename}`;
            data.fileType = req.file.mimetype;
            data.fileSize = req.file.size;
        } else {
            return res.status(400).json({
                status: "failed",
                message: "No file uploaded"
            });
        }

        const result = await File.create(data);

        res.status(200).json({
            status: "Successful",
            message: "File uploaded successfully!",
            data: result
        });
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: "File upload failed",
            error: error.message
        });
    }
};

// Get all media files
exports.getAllMedia = async (req, res) => {
    try {
        const result = await File.find();

        res.status(200).json({
            status: "success",
            message: "Files retrieved successfully",
            data: result
        });
    } catch (error) {
        res.status(400).json({
            status: "failed",
            message: "Failed to retrieve files",
            error: error.message
        });
    }
};

// Delete a media file
exports.deleteMedia = async (req, res) => {
    try {
        const id = req.params.id;

        // Fetch the file record from the database
        const fileRecord = await File.findById(id);
        if (!fileRecord) {
            return res.status(404).json({
                status: "failed",
                message: "File not found"
            });
        }

        // Extract filename from file path and delete the file from storage
        const filename = path.basename(fileRecord.path);
        const filePath = path.join(__dirname, '..', '..', 'media', filename);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('File deleted successfully');
        } else {
            console.log('File not found on server');
        }

        // Delete the file record from the database
        await File.deleteOne({ _id: id });

        res.status(200).json({
            status: "Success",
            message: "File deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            status: "failed",
            message: "Failed to delete file",
            error: error.message
        });
    }
};
