
import prisma from "../config/prisma.js";

const SLOT_LABELS = {
  MORNING: "Morning",
  AFTER_BREAKFAST: "After breakfast",
  AFTER_LUNCH: "After lunch",
  AFTER_DINNER: "After dinner",
};

const toDateOnly = (value) => {
  const dateString = String(value).slice(0, 10);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new Error("Please select a valid reading date.");
  }

  const date = new Date(`${dateString}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== dateString
  ) {
    throw new Error("Please select a valid reading date.");
  }

  return date;
};

const handleDatabaseError = (error, slot) => {
  if (error.code === "P2002") {
    throw new Error(
      `You already have a ${SLOT_LABELS[slot] || "slot"} reading for this date.`
    );
  }

  throw error;
};

export const createReading = async (userId, data) => {
  try {
    return await prisma.glucoseReading.create({
      data: {
        userId,
        glucoseValue: data.glucoseValue,
        measuredAt: toDateOnly(data.measuredAt),
        slot: data.slot,
        notes: data.notes?.trim() || null,
      },
    });
  } catch (error) {
    handleDatabaseError(error, data.slot);
  }
};

export const getReadings = async (userId) => {
  return prisma.glucoseReading.findMany({
    where: { userId },
    orderBy: [
      { measuredAt: "desc" },
      { slot: "asc" },
    ],
  });
};

export const updateReading = async (userId, id, data) => {
  const existing = await prisma.glucoseReading.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error("Reading not found");
  }

  const updateData = {
    ...(data.glucoseValue !== undefined && {
      glucoseValue: data.glucoseValue,
    }),
    ...(data.measuredAt !== undefined && {
      measuredAt: toDateOnly(data.measuredAt),
    }),
    ...(data.slot !== undefined && {
      slot: data.slot,
    }),
    ...(data.notes !== undefined && {
      notes: data.notes?.trim() || null,
    }),
  };

  try {
    return await prisma.glucoseReading.update({
      where: { id },
      data: updateData,
    });
  } catch (error) {
    handleDatabaseError(error, data.slot || existing.slot);
  }
};

export const deleteReading = async (userId, id) => {
  const existing = await prisma.glucoseReading.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error("Reading not found");
  }

  return prisma.glucoseReading.delete({
    where: { id },
  });
};
