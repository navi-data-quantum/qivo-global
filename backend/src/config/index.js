const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const hpp = require("hpp");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const config = require("./config/env");
const { connectDB, pool } = require("./config/db");
const logger = require("./config/logger");
const requestId = require("./middleware/requestId");
const geoProfile = require("./middleware/geoProfile");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const chatRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet());
app.use(hpp());
app.use(cors({ origin: true, credentials: true }));
app.use(requestId);
app.use(geoProfile);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (config.env === "development") {
  app.use(morgan("dev"));
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, try again later" },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

app.use("/api", apiLimiter);
app.use("/api/v1/auth", authLimiter);

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "QIVO Enterprise API is running", environment: config.env });
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ success: true, status: "UP", database: "CONNECTED", timestamp: new Date().toISOString() });
  } catch {
    res.status(500).json({ success: false, status: "DOWN", database: "DISCONNECTED" });
  }
});


app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/services", serviceRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/notifications", notificationRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(config.server.port, config.server.host, () => {
      logger.info(`Server running in ${config.env} mode on http://${config.server.host}:${config.server.port}`);
    });
  } catch (error) {
    logger.error("Server failed to start: %s", error.message);
    process.exit(1);
  }
};

startServer();

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection: %s", err.message);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception: %s", err.message);
  process.exit(1);
});

module.exports = app;