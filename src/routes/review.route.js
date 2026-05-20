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

const emailRegex = (email) =>
  new RegExp(
    `^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
    "i"
  );

const serializeReview = (doc) => {
  if (!doc) return null;

  return {
    ...doc,
    _id: String(doc._id),
    doctorId: doc.doctorId ? String(doc.doctorId) : doc.doctorId,
  };
};

const updateDoctorRating = async (db, doctorObjectId) => {
  const reviews = await db
    .collection("reviews")
    .find({ doctorId: doctorObjectId })
    .toArray();

  const rating =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((sum, r) => sum + Number(r.rating), 0) /
            reviews.length) *
            10
        ) / 10
      : null;

  await db.collection("doctors").updateOne(
    { _id: doctorObjectId },
    { $set: { rating } }
  );

  return rating;
};

// Create review (user must have an appointment with this doctor)
router.post("/", async (req, res) => {
  try {
    const { doctorId, userEmail, userName, rating, comment } =
      req.body;

    if (!doctorId || !userEmail || !rating) {
      return res.status(400).json({
        success: false,
        message: "doctorId, userEmail, and rating are required",
      });
    }

    const stars = Number(rating);

    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer from 1 to 5",
      });
    }

    const doctorObjectId = parseObjectId(doctorId);

    if (!doctorObjectId) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor id",
      });
    }

    const email = userEmail.trim().toLowerCase();
    const db = getDB();

    const doctor = await db
      .collection("doctors")
      .findOne({ _id: doctorObjectId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const hasAppointment = await db
      .collection("appointments")
      .findOne({
        doctorId: doctorObjectId,
        userEmail: emailRegex(email),
      });

    if (!hasAppointment) {
      return res.status(403).json({
        success: false,
        message:
          "You can only review a doctor after booking an appointment",
      });
    }

    const reviewsCollection = db.collection("reviews");

    const existing = await reviewsCollection.findOne({
      doctorId: doctorObjectId,
      userEmail: email,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this doctor",
      });
    }

    const review = {
      doctorId: doctorObjectId,
      doctorName: doctor.name || "",
      userEmail: email,
      userName: (userName || "").trim() || email,
      rating: stars,
      comment: (comment || "").trim(),
      createdAt: new Date(),
    };

    const result = await reviewsCollection.insertOne(review);

    const newRating = await updateDoctorRating(db, doctorObjectId);

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: serializeReview({
        _id: result.insertedId,
        ...review,
      }),
      doctorRating: newRating,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// List reviews for a doctor
router.get("/doctor/:doctorId", async (req, res) => {
  try {
    const doctorObjectId = parseObjectId(req.params.doctorId);

    if (!doctorObjectId) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor id",
      });
    }

    const db = getDB();
    const reviews = await db
      .collection("reviews")
      .find({ doctorId: doctorObjectId })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      data: reviews.map(serializeReview),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
