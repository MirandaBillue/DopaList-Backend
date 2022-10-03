/// DEPENDENCIES
require("dotenv").config();
const { PORT = 4000, MONGODB_URL } = process.env;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");





/// DATABASE CONNECTION
mongoose.connect(MONGODB_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
});
/// Connection Events
mongoose.connection
    .on("open", () => console.log("You are connected to mongoose"))
    .on("close", () => console.log("You are disconnected from mongoose"))
    .on("error", (error) => console.log(error));

/// ROUTES
///test route
app.get("/", (req, res) => {
    res.send("hello world");
});

/// LISTENER
app.listen(PORT, () => console.log(`listening on PORT ${PORT}`));
