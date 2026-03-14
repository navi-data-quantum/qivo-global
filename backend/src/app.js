const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");

const logger = require("./config/logger");
const requestId = require("./middleware/requestId");
const geoProfile = require("./middleware/geoProfile");

const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const chatRoutes = require("./routes/chatRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const pool = require("./config/db");

const app = express();

const NODE_ENV = process.env.NODE_ENV || "development";

app.set("trust proxy", 1);

app.disable("x-powered-by");
app.use(helmet());
app.use(hpp());
app.use(requestId);
app.use(geoProfile);

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

app.use("/api", apiLimiter);
app.use("/api/v1/auth", authLimiter);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Qivo Enterprise API is running",
    environment: NODE_ENV,
  });
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({
      success: true,
      status: "UP",
      database: "CONNECTED",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(500).json({
      success: false,
      status: "DOWN",
      database: "DISCONNECTED",
    });
  }
});

app.get("/geo-test", (req, res) => {
  const testIP = req.query.ip;
  if (testIP) {
    const country = require("./services/geoService").getCountryFromIP(testIP);
    return res.json({ success: true, testIP, country });
  }
  res.json({ success: true, geoProfile: req.geoProfile });
});

app.get("/favicon.ico", (req, res) => res.status(204).end());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/services", serviceRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/notifications", notificationRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;








