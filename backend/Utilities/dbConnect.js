const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const colors = require("colors");

const dbConnect = () => {
    mongoose.connect(process.env.mongodbAtlas, {
        dbName:"MediaStorage"
    }) 
        .then(() => {
        console.log(`Database Connected Succesfully`.white.bgRed.bold)
        }).catch((err) => {
        console.log(err.message);
    })
}

module.exports = dbConnect;