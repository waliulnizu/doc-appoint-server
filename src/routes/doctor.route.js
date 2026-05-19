const express = require("express");

const {
  getAllDoctors,
  getSingleDoctor,
  addDoctor,
} = require("../controllers/doctor.controller");

const router = express.Router();

// Get all doctors
router.get("/", getAllDoctors);

// Get single doctor
router.get("/:id", getSingleDoctor);

// Add doctor
router.post("/", addDoctor);

module.exports = router;