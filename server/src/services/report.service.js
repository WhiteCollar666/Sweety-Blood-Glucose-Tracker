
import prisma from "../config/prisma.js";

const getSummary = (readings) => {
  if (!readings.length) {
    return {
      highest: null,
      lowest: null,
      average: null,
      totalReadings: 0,
    };
  }

  const values = readings.map((reading) => reading.glucoseValue);

  const total = values.reduce((sum, value) => sum + value, 0);

  return {
    highest: Math.max(...values),
    lowest: Math.min(...values),
    average: Number((total / values.length).toFixed(1)),
    totalReadings: values.length,
  };
};

const dateToUTC = (dateString) =>
  new Date(`${dateString}T00:00:00.000Z`);

const getReadingsInRange = async (userId, start, end) => {
  return prisma.glucoseReading.findMany({
    where: {
      userId,
      measuredAt: {
        gte: start,
        lt: end,
      },
    },
    orderBy: [
      { measuredAt: "asc" },
      { slot: "asc" },
    ],
  });
};

// DAILY REPORT
export const getDailyReport = async (userId, date) => {
  const start = dateToUTC(date);
  const end = new Date(start);

  end.setUTCDate(end.getUTCDate() + 1);

  const readings = await getReadingsInRange(userId, start, end);

  return {
    period: "Daily",
    startDate: date,
    endDate: date,
    summary: getSummary(readings),
    readings,
  };
};

// MONTH-TO-DATE REPORT
export const getMonthToDateReport = async (userId, date) => {
  const selected = dateToUTC(date);

  const start = new Date(
    Date.UTC(
      selected.getUTCFullYear(),
      selected.getUTCMonth(),
      1
    )
  );

  const end = new Date(selected);
  end.setUTCDate(end.getUTCDate() + 1);

  const readings = await getReadingsInRange(userId, start, end);

  return {
    period: "Month-to-date",
    startDate: start.toISOString().slice(0, 10),
    endDate: date,
    summary: getSummary(readings),
    readings,
  };
};

// PREVIOUS MONTH REPORT
export const getMonthlyReport = async (userId, date) => {
  const selected = dateToUTC(date);

  const start = new Date(
    Date.UTC(
      selected.getUTCFullYear(),
      selected.getUTCMonth() - 1,
      1
    )
  );

  const end = new Date(
    Date.UTC(
      selected.getUTCFullYear(),
      selected.getUTCMonth(),
      1
    )
  );

  const readings = await getReadingsInRange(userId, start, end);

  const dailyGroups = {};

  for (const reading of readings) {
    const readingDate = reading.measuredAt
      .toISOString()
      .slice(0, 10);

    if (!dailyGroups[readingDate]) {
      dailyGroups[readingDate] = [];
    }

    dailyGroups[readingDate].push(reading);
  }

  const dailyBreakdown = Object.entries(dailyGroups).map(
    ([readingDate, dayReadings]) => ({
      date: readingDate,
      summary: getSummary(dayReadings),
      readings: dayReadings,
    })
  );

  const lastDay = new Date(end);
  lastDay.setUTCDate(lastDay.getUTCDate() - 1);

  return {
    period: "Previous month",
    startDate: start.toISOString().slice(0, 10),
    endDate: lastDay.toISOString().slice(0, 10),
    summary: getSummary(readings),
    dailyBreakdown,
    readings,
  };
};
