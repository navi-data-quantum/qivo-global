const { createLogger, format, transports } = require("winston");
const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: format.combine(format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), format.errors({ stack: true }), format.json()),
  transports: [
    new transports.Console({
      format: process.env.NODE_ENV === "production"
        ? format.json()
        : format.combine(format.colorize(), format.printf(({ level, message, timestamp }) => `[${timestamp}] ${level}: ${message}`)),
    }),
    new transports.File({ filename: path.join(logDir, "error.log"), level: "error" }),
    new transports.File({ filename: path.join(logDir, "combined.log") }),
  ],
  exitOnError: false,
});

module.exports = logger;
