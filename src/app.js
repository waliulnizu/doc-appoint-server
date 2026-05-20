const express = require("express");
const cors = require("cors");

const healthRoute = require("./routes/health.route");
const doctorRoute = require("./routes/doctor.route");
const authRoute = require("./routes/auth.route");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/", healthRoute);
app.use("/api/auth", authRoute);
app.use("/api/doctors", doctorRoute);

module.exports = app;