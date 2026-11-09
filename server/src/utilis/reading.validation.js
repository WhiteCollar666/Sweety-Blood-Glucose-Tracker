export const READING_SLOTS = [
  "MORNING",
  "AFTER_BREAKFAST",
  "AFTER_LUNCH",
  "AFTER_DINNER",
];

export function validateGlucoseValue(value) {
  const number = Number(value);

  if (
    value === "" ||
    value === null ||
    value === undefined ||
    !Number.isInteger(number) ||
    number < 40 ||
    number > 600
  ) {
    return "Glucose value must be a whole number between 40 and 600.";
  }

  return null;
}

export function validateReadingDate(date, today) {
  if (
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    return "Invalid date format.";
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  ) {
    return "Invalid date.";
  }

  if (date > today) {
    return "Future dates are not allowed.";
  }

  return null;
}

export function validateReadingSlot(slot) {
  if (!READING_SLOTS.includes(slot)) {
    return "Invalid reading slot.";
  }

  return null;
}