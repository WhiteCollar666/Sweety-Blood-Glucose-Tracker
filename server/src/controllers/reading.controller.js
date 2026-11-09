
import {
  createReading,
  getReadings,
  updateReading,
  deleteReading,
} from "../services/reading.service.js";

const VALID_SLOTS = [
  "MORNING",
  "AFTER_BREAKFAST",
  "AFTER_LUNCH",
  "AFTER_DINNER",
];

const SLOT_LABELS = {
  MORNING: "Morning",
  AFTER_BREAKFAST: "After breakfast",
  AFTER_LUNCH: "After lunch",
  AFTER_DINNER: "After dinner",
};

const getToday = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: process.env.APP_TIME_ZONE || "Asia/Kolkata",
  }).format(new Date());

const validateDate = (value) => {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
};

const validateReading = (data, partial = false) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "Invalid reading data.";
  }

  const allowedFields = [
    "glucoseValue",
    "measuredAt",
    "slot",
    "notes",
  ];

  if (Object.keys(data).some((key) => !allowedFields.includes(key))) {
    return "Unsupported reading field.";
  }

  if (partial && Object.keys(data).length === 0) {
    return "Please provide at least one field to update.";
  }

  if (!partial || data.glucoseValue !== undefined) {
    if (
      !Number.isInteger(data.glucoseValue) ||
      data.glucoseValue < 40 ||
      data.glucoseValue > 600
    ) {
      return "Value must be between 40 and 600 mg/dl.";
    }
  }

  if (!partial || data.measuredAt !== undefined) {
    if (!validateDate(data.measuredAt)) {
      return "Please select a valid reading date.";
    }

    if (data.measuredAt > getToday()) {
      return "Date cannot be in the future.";
    }
  }

  if (!partial || data.slot !== undefined) {
    if (!VALID_SLOTS.includes(data.slot)) {
      return "Please select a valid time slot.";
    }
  }

  if (data.notes !== undefined && data.notes !== null) {
    if (
      typeof data.notes !== "string" ||
      data.notes.length > 1000
    ) {
      return "Notes cannot exceed 1000 characters.";
    }
  }

  return null;
};

// CREATE READING
export const addReading = async (req, res) => {
  try {
    const error = validateReading(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const readings = await getReadings(req.user.userId);
    const date = req.body.measuredAt;

    const sameDay = readings.filter(
      (reading) =>
        reading.measuredAt.toISOString().slice(0, 10) === date
    );

    if (sameDay.some((reading) => reading.slot === req.body.slot)) {
      return res.status(409).json({
        success: false,
        message: `You already have a ${SLOT_LABELS[req.body.slot]} reading for this date.`,
      });
    }

    if (sameDay.length >= 4) {
      return res.status(400).json({
        success: false,
        message: "You can add only 4 readings per day.",
      });
    }

    const reading = await createReading(req.user.userId, req.body);

    return res.status(201).json({
      success: true,
      message: "Glucose reading added successfully",
      reading,
    });
  } catch (error) {
    if (error.message.startsWith("You already have")) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Add reading error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to add glucose reading",
    });
  }
};

// GET READINGS
export const fetchReadings = async (req, res) => {
  try {
    const readings = await getReadings(req.user.userId);

    return res.status(200).json({
      success: true,
      count: readings.length,
      readings,
    });
  } catch (error) {
    console.error("Fetch readings error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch readings",
    });
  }
};

// UPDATE READING
export const editReading = async (req, res) => {
  try {
    const error = validateReading(req.body, true);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const readings = await getReadings(req.user.userId);
    const existing = readings.find(
      (reading) => reading.id === req.params.id
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Reading not found",
      });
    }

    const targetDate =
      req.body.measuredAt ||
      existing.measuredAt.toISOString().slice(0, 10);

    const targetSlot = req.body.slot || existing.slot;

    if (targetDate > getToday()) {
      return res.status(400).json({
        success: false,
        message: "Date cannot be in the future.",
      });
    }

    const sameDay = readings.filter(
      (reading) =>
        reading.id !== existing.id &&
        reading.measuredAt.toISOString().slice(0, 10) === targetDate
    );

    if (sameDay.some((reading) => reading.slot === targetSlot)) {
      return res.status(409).json({
        success: false,
        message: `You already have a ${SLOT_LABELS[targetSlot]} reading for this date.`,
      });
    }

    if (sameDay.length >= 4) {
      return res.status(400).json({
        success: false,
        message: "You can add only 4 readings per day.",
      });
    }

    const reading = await updateReading(
      req.user.userId,
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Reading updated successfully",
      reading,
    });
  } catch (error) {
    if (error.message === "Reading not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.startsWith("You already have")) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update reading error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update reading",
    });
  }
};

// DELETE READING
export const removeReading = async (req, res) => {
  try {
    await deleteReading(req.user.userId, req.params.id);

    return res.status(200).json({
      success: true,
      message: "Reading deleted successfully",
    });
  } catch (error) {
    if (error.message === "Reading not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Delete reading error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete reading",
    });
  }
};
