const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid"); // For generating unique user IDs

const app = express();
require("dotenv").config();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

// In-memory database
const users = [];
const exercises = {};

// Routes
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// Create a new user
app.post("/api/users", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const _id = uuidv4();
  const newUser = { username, _id };
  users.push(newUser);

  res.json(newUser);
});

// Get all users
app.get("/api/users", (req, res) => {
  res.json(users);
});

// Add exercise
app.post("/api/users/:_id/exercises", (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  if (!description || !duration) {
    return res
      .status(400)
      .json({ error: "Description and duration are required" });
  }

  const user = users.find((user) => user._id === _id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const exercise = {
    description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
  };

  if (!exercises[_id]) exercises[_id] = [];
  exercises[_id].push(exercise);

  res.json({
    username: user.username,
    ...exercise,
    _id: user._id,
  });
});

// Get user logs
app.get("/api/users/:_id/logs", (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = users.find((user) => user._id === _id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  let userExercises = exercises[_id] || [];

  // Apply filters
  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter((ex) => new Date(ex.date) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter((ex) => new Date(ex.date) <= toDate);
  }
  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    count: userExercises.length,
    _id: user._id,
    log: userExercises,
  });
});

// Listener
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
