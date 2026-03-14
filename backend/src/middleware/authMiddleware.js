const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { findUserById } = require("../models/user/userModel");

const protect = asyncHandler(async (req, res, next) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not configured");

  let token = null;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) throw new AppError("Not authorized", 401);

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }

  const user = await findUserById(decoded.id);

  if (!user) throw new AppError("User not found", 404);

  if (decoded.tokenVersion !== user.token_version)
    throw new AppError("Token revoked", 401);

  if (user.lock_until && new Date(user.lock_until) > new Date())
    throw new AppError("Account locked", 423);

  req.user = {
    id: user.id,
    role: user.role,
    email: user.email,
    language: user.language,
  };

  next();
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return next(new AppError("Not authenticated", 401));

    if (!roles.includes(req.user.role))
      return next(new AppError("Forbidden", 403));

    next();
  };
};

module.exports = { protect, authorize };
