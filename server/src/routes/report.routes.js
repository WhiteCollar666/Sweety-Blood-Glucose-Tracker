
import express from "express";

import {
  dailyReport,
  monthToDateReport,
  monthlyReport,
} from "../controllers/report.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/daily", dailyReport);
router.get("/month-to-date", monthToDateReport);
router.get("/monthly", monthlyReport);

export default router;
