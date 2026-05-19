const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Route
app.get("/", (req, res) => {
  res.send("DocAppoint Server Running");
});

// Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});