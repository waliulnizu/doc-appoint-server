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

// Doctor working hours (24h format). Change here to change clinic schedule.
const CLINIC_START_HOUR = 9;
const CLINIC_END_HOUR = 18;

// Slot length in minutes
const SLOT_MINUTES = 30;

const pad = (n) => String(n).padStart(2, "0");

/**
 * Build every 30-min slot between clinic start and end for a given date.
 * Past slots for today's date are marked unavailable automatically.
 */
const buildSlots = (dateStr) => {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const slots = [];

  for (let minutes = CLINIC_START_HOUR * 60; minutes < CLINIC_END_HOUR * 60; minutes += SLOT_MINUTES) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    // Add a buffer: a slot must be at least 60 min ahead to be selectable
    const isPast = dateStr === todayStr && minutes <= currentMinutes + 60;

    slots.push({
      time: `${pad(hour)}:${pad(minute)}`,
      label: formatLabel(hour, minute),
      status: isPast ? "Booked" : "Available",
    });
  }

  return slots;
};

const formatLabel = (hour, minute) => {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${pad(minute)} ${period}`;
};

/**
 * GET /api/appointments/slots/:doctorId?date=YYYY-MM-DD
 * Returns all 30-min slots with booked / available status.
 */
router.get("/:doctorId", async (req, res) => {
  try {
    const doctorObjectId = parseObjectId(req.params.doctorId);

    if (!doctorObjectId) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor id",
      });
    }

    const date = String(req.query.date || "").trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "date must be in YYYY-MM-DD format",
      });
    }

    const db = getDB();
    const collection = db.collection("appointments");

    const existing = await collection
      .find({
        doctorId: doctorObjectId,
        appointmentDate: date,
      })
      .toArray();

    const bookedTimes = new Set(
      existing
        .filter((a) => !a.cancelled)
        .map((a) => a.appointmentTime)
    );

    const slots = buildSlots(date).map((slot) => ({
      ...slot,
      status: bookedTimes.has(slot.time)
        ? "Booked"
        : slot.status,
    }));

    res.status(200).json({
      success: true,
      data: {
        doctorId: String(doctorObjectId),
        date,
        clinicHours: `${formatLabel(CLINIC_START_HOUR, 0)} - ${formatLabel(CLINIC_END_HOUR, 0)}`,
        slotMinutes: SLOT_MINUTES,
        totalSlots: slots.length,
        availableCount: slots.filter((s) => s.status === "Available").length,
        slots,
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