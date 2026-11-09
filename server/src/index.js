
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import prisma from "./config/prisma.js";
import authRoutes from "./routes/auth.routes.js";
import readingRoutes from "./routes/reading.routes.js";
import reportRoutes from "./routes/report.routes.js";

const app = express();

// 1. Security headers
app.use(helmet());

// 2. Request body size limit
app.use(express.json({ limit: "10kb" }));

// 3. CORS configuration
const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 4. Authentication rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

// 5. API routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/readings", readingRoutes);
app.use("/api/reports", reportRoutes);

// 6. Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Sweety Glucose Tracker API is running",
  });
});

// 7. Database health check
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      success: true,
      message: "API and database connected successfully",
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// 8. Handle unknown routes
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// 9. Centralized error handler
app.use((err, req, res, next) => {
  console.error("API Error:", err.message);

  let statusCode = err.status || err.statusCode || 500;

  if (err.message === "Not allowed by CORS") {
    statusCode = 403;
  }

  if (statusCode < 400 || statusCode > 599) {
    statusCode = 500;
  }

  const errorMessages = {
    400: "Invalid request",
    403: "Request origin not allowed",
    413: "Request body is too large",
    415: "Unsupported content type",
  };

  return res.status(statusCode).json({
    success: false,
    message: errorMessages[statusCode] || "Internal server error",
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Sweety API running on port ${PORT}`);
});
