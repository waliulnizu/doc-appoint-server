const express = require("express");
const cors = require("cors");

const healthRoute = require("./routes/health.route");
const doctorRoute = require("./routes/doctor.route");
const authRoute = require("./routes/auth.route");
const appointmentRoute = require("./routes/appointment.route");
const reviewRoute = require("./routes/review.route");

const app = express();

const clientOrigin =
  process.env.CLIENT_URL || "http://localhost:3000";

// Auth cookies need credentials; wildcard "*" is not allowed then.
app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/", healthRoute);
app.use("/api/auth", authRoute);
app.use("/api/doctors", doctorRoute);
app.use("/api/appointments", appointmentRoute);
app.use("/api/reviews", reviewRoute);

module.exports = app;