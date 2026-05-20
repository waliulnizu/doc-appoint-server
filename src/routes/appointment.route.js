const express = require("express");
const { ObjectId } = require("mongodb");

const { getDB } = require("../config/db");

const router = express.Router();

const parseObjectId = (id) => {
  if (id == null || typeof id !== "string" || id.trim() === "") {
    return null;
  }

  const trimmed = id.trim();

  if (!ObjectId.isValid(trimmed)) {
    return null;
  }

  try {
    return new ObjectId(trimmed);
  } catch {
    return null;
  }
};

const serializeAppointment = (doc) => {
  if (!doc) return null;

  return {
    ...doc,
    _id: String(doc._id),
    doctorId: doc.doctorId ? String(doc.doctorId) : doc.doctorId,
  };
};

// Create appointment
router.post("/", async (req, res) => {
  try {
    const {
      patientName,
      userEmail,
      gender,
      phone,
      appointmentDate,
      appointmentTime,
      doctorId,
      doctorName,
    } = req.body;

    if (
      !patientName ||
      !userEmail ||
      !gender ||
      !phone ||
      !appointmentDate ||
      !appointmentTime ||
      !doctorId
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const doctorObjectId = parseObjectId(doctorId);

    if (!doctorObjectId) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor id",
      });
    }

    const db = getDB();
    const collection = db.collection("appointments");

    const appointment = {
      patientName: patientName.trim(),
      userEmail: userEmail.trim(),
      gender,
      phone: phone.trim(),
      appointmentDate,
      appointmentTime,
      doctorId: doctorObjectId,
      doctorName: doctorName || "",
      createdAt: new Date(),
    };

    const result = await collection.insertOne(appointment);

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: {
        _id: String(result.insertedId),
        ...appointment,
        doctorId: String(doctorObjectId),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update appointment by id
router.put("/:id", async (req, res) => {
  try {
    const appointmentId = parseObjectId(req.params.id);

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment id",
      });
    }

    const {
      patientName,
      gender,
      phone,
      appointmentDate,
      appointmentTime,
    } = req.body;

    if (
      !patientName ||
      !gender ||
      !phone ||
      !appointmentDate ||
      !appointmentTime
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (gender !== "Male" && gender !== "Female") {
      return res.status(400).json({
        success: false,
        message: "Gender must be Male or Female",
      });
    }

    const db = getDB();
    const collection = db.collection("appointments");

    const updateResult = await collection.updateOne(
      { _id: appointmentId },
      {
        $set: {
          patientName: patientName.trim(),
          gender,
          phone: phone.trim(),
          appointmentDate,
          appointmentTime,
          updatedAt: new Date(),
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const updated = await collection.findOne({
      _id: appointmentId,
    });

    res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      data: serializeAppointment(updated),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete appointment by id
router.delete("/:id", async (req, res) => {
  try {
    const appointmentId = parseObjectId(req.params.id);

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment id",
      });
    }

    const db = getDB();
    const collection = db.collection("appointments");

    const result = await collection.deleteOne({
      _id: appointmentId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get user appointments by email
router.get("/user/:email", async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("appointments");

    const email = req.params.email;

    const result = await collection
      .find({ userEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    const data = result.map(serializeAppointment);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
