const express = require("express");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
const healthRoute = require("./routes/health.route");
app.use("/", healthRoute);

module.exports = app;