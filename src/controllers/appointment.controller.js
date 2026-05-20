const { getDB } = require("../config/db");

/**
 * Create Appointment
 */
const createAppointment = async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("appointments");

    const appointment = req.body;

    const result = await collection.insertOne({
      ...appointment,
      createdAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully!",
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get appointments for logged-in user
 */
const getUserAppointments = async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("appointments");

    const { email } = req.query;

    const query = email ? { userEmail: email } : {};

    const appointments = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete appointment
 */
const deleteAppointment = async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection("appointments");

    const { id } = req.params;

    const result = await collection.deleteOne({
      _id: new (require("mongodb").ObjectId)(id),
    });

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully!",
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createAppointment,
  getUserAppointments,
  deleteAppointment,
};