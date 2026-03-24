const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { findUserById } = require("../models/user/userModel");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new AppError("Not authorized", 401);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await findUserById(decoded.id);
  if (!user) throw new AppError("User not found", 404);

  req.user = user;
  next();
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("Not authorized", 403));
    }
    next();
  };
};

module.exports = { protect, authorize };