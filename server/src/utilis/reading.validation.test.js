import test from "node:test";
import assert from "node:assert/strict";

import {
  validateGlucoseValue,
  validateReadingDate,
  validateReadingSlot,
} from "./reading.validation.js";

test("accepts valid glucose values", () => {
  assert.equal(validateGlucoseValue(40), null);
  assert.equal(validateGlucoseValue(100), null);
  assert.equal(validateGlucoseValue(600), null);
});

test("rejects values below 40", () => {
  assert.notEqual(validateGlucoseValue(39), null);
});

test("rejects values above 600", () => {
  assert.notEqual(validateGlucoseValue(601), null);
});

test("rejects decimal values", () => {
  assert.notEqual(validateGlucoseValue(41.5), null);
});

test("rejects empty glucose values", () => {
  assert.notEqual(validateGlucoseValue(""), null);
});

test("accepts valid reading dates", () => {
  assert.equal(
    validateReadingDate("2026-11-04", "2026-11-09"),
    null
  );
});

test("rejects future dates", () => {
  assert.notEqual(
    validateReadingDate("2026-11-10", "2026-11-09"),
    null
  );
});

test("rejects invalid date formats", () => {
  assert.notEqual(
    validateReadingDate("04-11-2026", "2026-11-09"),
    null
  );
});

test("rejects impossible calendar dates", () => {
  assert.notEqual(
    validateReadingDate("2026-02-30", "2026-11-09"),
    null
  );
});

test("accepts all four reading slots", () => {
  const slots = [
    "MORNING",
    "AFTER_BREAKFAST",
    "AFTER_LUNCH",
    "AFTER_DINNER",
  ];

  for (const slot of slots) {
    assert.equal(validateReadingSlot(slot), null);
  }
});

test("rejects invalid reading slots", () => {
  assert.notEqual(validateReadingSlot("NIGHT"), null);
});