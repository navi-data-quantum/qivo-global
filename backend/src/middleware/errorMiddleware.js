const AppError = require("../utils/AppError");
const logger = require("../config/logger");

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = "Something went wrong";

  if (err instanceof AppError) message = err.message;
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }
  if (err.code === "23505") {
    statusCode = 409;
    message = "Duplicate field value";
  }
  if (err.code === "22P02") {
    statusCode = 400;
    message = "Invalid input syntax";
  }
  if (err.code === "23503") {
    statusCode = 400;
    message = "Referenced resource does not exist";
  }

  const logPayload = {
    requestId: req.id,
    message: err.message,
    stack: err.stack,
    statusCode,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  };

  if (statusCode >= 500) logger.error(logPayload);
  else logger.warn(logPayload);

  res.status(statusCode).json({
    success: false,
    message,
    requestId: req.id,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

const notFound = (req, res, next) => {
  next(new AppError(`Route not found - ${req.originalUrl}`, 404));
};

module.exports = { errorHandler, notFound };




