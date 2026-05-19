const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("DocAppoint API is running 🚀");
});

module.exports = router;