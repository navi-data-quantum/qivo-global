const admin = require("../config/firebaseAdmin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { findUserById, saveRefreshToken } = require("../models/user/userModel");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const firebaseLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) throw new AppError("ID Token required", 400);

  const decodedToken = await admin.auth().verifyIdToken(idToken);

  const user = await findUserById(decodedToken.uid);
  if (!user) throw new AppError("User not found", 404);

  const accessToken = jwt.sign(
    { id: user.id, role: user.role, tokenVersion: user.token_version, language: user.language },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshRaw = jwt.sign(
    { id: user.id, tokenVersion: user.token_version },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  const hashed = await bcrypt.hash(refreshRaw, 10);

  await saveRefreshToken(user.id, hashed);

  res.cookie("refreshToken", refreshRaw, cookieOptions);

  res.status(200).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      language: user.language
    },
    accessToken
  });
});

module.exports = { firebaseLogin };