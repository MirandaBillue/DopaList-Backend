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

///Models
const TodoSchema = new mongoose.Schema({
    name: {type:String, required:true},
    uid: String
}, {
    timestamps: true
});

const Todo = mongoose.model("Todo", TodoSchema);

/// MiddleWare
app.use(cors()); 
app.use(morgan("dev")); 
app.use(express.json());

///google firebase middleware
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(async function(req, res, next) {
    const token = req.get("Authorization");
    if(!token) return next();
    const user = await admin.auth().verifyIdToken(token.replace("Bearer ", ""));
    if(user) {
      req.user = user;
    } else {
      return res.status(401).json({error: 'token invalid'});
    }
    next();
  });
  
  function isAuthenticated(req, res, next){
    if(req.user) return next();
    res.status(401).json({error: 'please login first'});
  }

/// ROUTES
///test route
app.get("/", (req, res) => {
    res.send("hello world");
});

///todo routes
app.get("/todo", async (req, res) => {
    const query = req.query.uid ? { createdById: req.query.uid } : {};
    try {
        // send all todo
        res.json(await Todo.find(query));
    } catch (error) {
        //send error
        res.status(400).json(error);
    }
});

// todo CREATE ROUTE
app.post("/todo", isAuthenticated, async (req, res) => {
    try {
        req.body.createdById = req.user.uid;
        // send all todo
        res.json(await Todo.create(req.body));
    } catch (error) {
        //send error
        res.status(400).json(error);
    }
});

// todo DELETE ROUTE
app.delete("/todo/:id", isAuthenticated, async (req, res) => {
    try {
        // send all todo
        res.json(await Todo.findByIdAndRemove(req.params.id));
    } catch (error) {
        //send error
        res.status(400).json(error);
    }
});

// todo UPDATE ROUTE
app.put("/todo/:id", isAuthenticated, async (req, res) => {
    try {
        // send all todo
        res.json(
            await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true })
        );
    } catch (error) {
        //send error
        res.status(400).json(error);
    }
});


/// LISTENER
app.listen(PORT, () => console.log(`listening on PORT ${PORT}`));
