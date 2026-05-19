const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

// Get all doctors
const getAllDoctors = async (req, res) => {
  try {
    const db = getDB();

    const doctorsCollection = db.collection("doctors");

    const doctors = await doctorsCollection.find().toArray();

    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single doctor
const getSingleDoctor = async (req, res) => {
  try {
    const db = getDB();

    const doctorsCollection = db.collection("doctors");

    const id = req.params.id;

    const doctor = await doctorsCollection.findOne({
      _id: new ObjectId(id),
    });

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add doctor
const addDoctor = async (req, res) => {
  try {
    const db = getDB();

    const doctorsCollection = db.collection("doctors");

    const doctorData = req.body;

    const result = await doctorsCollection.insertOne(doctorData);

    res.status(201).json({
      success: true,
      message: "Doctor added successfully",
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
  getAllDoctors,
  getSingleDoctor,
  addDoctor,
};