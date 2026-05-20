const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

/** Plain JSON shape: `_id` is always a string (avoids client URL bugs). */
const serializeDoctor = (doc) => {
  if (!doc) return null;

  return {
    ...doc,
    _id:
      doc._id != null
        ? String(doc._id)
        : doc._id,
  };
};

const parseDoctorObjectId = (id) => {
  if (
    id == null ||
    typeof id !== "string" ||
    id.trim() === ""
  ) {
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

// Get all doctors
const getAllDoctors = async (req, res) => {
  try {
    const db = getDB();

    const doctorsCollection = db.collection("doctors");

    const doctors = await doctorsCollection.find().toArray();

    res.status(200).json({
      success: true,
      data: doctors.map(serializeDoctor),
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

    const objectId = parseDoctorObjectId(id);

    if (!objectId) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor id",
      });
    }

    const doctor = await doctorsCollection.findOne({
      _id: objectId,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      success: true,
      data: serializeDoctor(doctor),
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