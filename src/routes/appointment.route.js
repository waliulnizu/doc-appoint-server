const express = require("express");
const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const router = express.Router();

// Create appointment
router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("appointments");

    const data = req.body;

    const result = await collection.insertOne({
      ...data,
      doctorId: new ObjectId(data.doctorId),
      createdAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get user appointments
router.get("/:email", async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("appointments");

    const email = req.params.email;

    const result = await collection
      .find({ userEmail: email })
      .toArray();

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;