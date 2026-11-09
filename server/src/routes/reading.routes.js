
import express from "express";
import {
  addReading,
  fetchReadings,
  editReading,
  removeReading,
} from "../controllers/reading.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", addReading);
router.get("/", fetchReadings);
router.put("/:id", editReading);
router.delete("/:id", removeReading);

export default router;
