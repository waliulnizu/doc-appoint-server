const { ObjectId } = require("mongodb");

const appointmentSchema = {
  userEmail: String,
  doctorId: ObjectId,
  doctorName: String,
  patientName: String,
  gender: String,
  phone: String,
  appointmentDate: String,
  appointmentTime: String,
  createdAt: {
    type: Date,
    default: new Date(),
  },
};

module.exports = appointmentSchema;