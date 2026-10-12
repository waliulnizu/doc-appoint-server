const express = require("express");

const { getDB } = require("../config/db");

const router = express.Router();

// Public platform stats for the homepage
router.get("/", async (req, res) => {
  try {
    const db = getDB();

    const [totalDoctors, totalAppointments, totalReviews, doctors] =
      await Promise.all([
        db.collection("doctors").countDocuments(),
        db.collection("appointments").countDocuments(),
        db.collection("reviews").countDocuments(),
        db.collection("doctors").find({}, { projection: { specialty: 1, hospital: 1 } }).toArray(),
      ]);

    const specialties = new Set();
    const hospitals = new Set();

    for (const doc of doctors) {
      if (doc.specialty) specialties.add(doc.specialty);
      if (doc.hospital) hospitals.add(doc.hospital);
    }

    res.status(200).json({
      success: true,
      data: {
        totalDoctors,
        totalAppointments,
        totalReviews,
        totalSpecialties: specialties.size,
        totalHospitals: hospitals.size,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
