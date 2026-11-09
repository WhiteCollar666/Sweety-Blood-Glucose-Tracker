
import {
  getDailyReport,
  getMonthToDateReport,
  getMonthlyReport,
} from "../services/report.service.js";

const getToday = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: process.env.APP_TIME_ZONE || "Asia/Kolkata",
  }).format(new Date());

const isValidDate = (value) => {
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

const getSelectedDate = (req, res) => {
  const date = req.query.date || getToday();

  if (!isValidDate(date)) {
    res.status(400).json({
      success: false,
      message: "Date must be a valid YYYY-MM-DD date.",
    });

    return null;
  }

  if (date > getToday()) {
    res.status(400).json({
      success: false,
      message: "Date cannot be in the future.",
    });

    return null;
  }

  return date;
};

// DAILY REPORT
export const dailyReport = async (req, res) => {
  try {
    const date = getSelectedDate(req, res);

    if (!date) return;

    const report = await getDailyReport(
      req.user.userId,
      date
    );

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Daily report error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate daily report",
    });
  }
};

// MONTH-TO-DATE REPORT
export const monthToDateReport = async (req, res) => {
  try {
    const date = getSelectedDate(req, res);

    if (!date) return;

    const report = await getMonthToDateReport(
      req.user.userId,
      date
    );

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Month-to-date report error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate month-to-date report",
    });
  }
};

// PREVIOUS MONTH REPORT
export const monthlyReport = async (req, res) => {
  try {
    const date = getSelectedDate(req, res);

    if (!date) return;

    const report = await getMonthlyReport(
      req.user.userId,
      date
    );

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Monthly report error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate monthly report",
    });
  }
};
