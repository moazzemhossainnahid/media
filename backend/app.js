const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;
const colors = require("colors");
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();



app.use(cors());
app.use(express.json());


app.use('/public', express.static('public'))

// import routes
const mediaRoute = require('./v1/Routes/media.route');
const dbConnect = require("./Utilities/dbConnect");




// declare routes
app.use('/api/v1/media', mediaRoute);



dbConnect();


app.get("/", (req, res) => {
    try {
        res.send("Welcome to Media Storage Server !");
    } catch (error) {
        console.log(error.message);
    };
});


app.listen(PORT, () => {
    try {
        console.log(`server is successfully running on port ${PORT}!`.red.bold);
    } catch (error) {
        console.log(error.message);
    };
});



// Serve static files including uploaded media
app.use('/media', express.static(path.join(__dirname, 'media', 'uploads')));


app.all("*", (req, res) => {
    try {
        res.send("No Routes Found");
    } catch (error) {
        console.log(error.message);
    };
});
