const { createLogger, format, transports } = require("winston");
const path = require("path");

const logDir = path.join(__dirname, "../../logs");

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      ),
    }),
    new transports.File({ filename: path.join(logDir, "combined.log") }),
    new transports.File({ level: "error", filename: path.join(logDir, "error.log") }),
  ],
  exitOnError: false,
});

module.exports = logger;
