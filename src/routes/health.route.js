const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("DocAppoint API is running 🚀");
});

router.get("/health", (req, res) => {
  res.json({ success: true, message: "DocAppoint API is healthy" });
});

module.exports = router;