const express = require("express");
const cors = require("cors");

const healthRoute = require("./routes/health.route");
const doctorRoute = require("./routes/doctor.route");
const authRoute = require("./routes/auth.route");
const appointmentRoute = require("./routes/appointment.route");
const reviewRoute = require("./routes/review.route");

const app = express();

// ===============================
// Allowed Origins
// ===============================

const clientOrigin =
  process.env.CLIENT_URL ||
  "https://doc-appoint-client-sepia.vercel.app";

const allowedOrigins = [
  "http://localhost:3000",
  "https://doc-appoint-client-sepia.vercel.app",
  clientOrigin,
]
  .filter(Boolean)
  .filter((value, index, self) => self.indexOf(value) === index);

// ===============================
// Middleware
// ===============================

// CORS Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, origin);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());

// ===============================
// Routes
// ===============================

app.use("/", healthRoute);
app.use("/api/auth", authRoute);
app.use("/api/doctors", doctorRoute);
app.use("/api/appointments", appointmentRoute);
app.use("/api/reviews", reviewRoute);

// ===============================
// Export App
// ===============================

module.exports = app;