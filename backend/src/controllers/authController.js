const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const sendEmail = require("../utils/email");
const { PrismaClient } = require("@prisma/client");
const { TranslationService } = require("../services/translation.service");
const { sendResetPasswordEmail } = require("../services/emailService");

const prisma = new PrismaClient();
const tService = new TranslationService(prisma);

const {
  createUser,
  findUserByEmail,
  findUserById,
  saveRefreshToken,
  findRefreshTokenByUserId,
  deleteRefreshToken,
  incrementLoginAttempts,
  resetLoginAttempts,
  lockAccount,
  incrementTokenVersion,
  verifyUserEmail,
  savePasswordResetToken,
  findUserByResetToken,
  updateUserPassword,
  clearPasswordResetToken,
  updateUserLanguage,
} = require("../models/user/userModel");

const generateAccessToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role, tokenVersion: user.token_version, language: user.language },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

const generateRefreshToken = (user) =>
  jwt.sign({ id: user.id, tokenVersion: user.token_version }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000;

const register = asyncHandler(async (req, res) => {
  const { name, email, password, language } = req.body;
  const existing = await findUserByEmail(email);
  if (existing) throw new AppError(await tService.t("EMAIL_EXISTS", language), 409);

  const hashedPassword = await bcrypt.hash(password, 12);
  const rawEmailToken = crypto.randomBytes(32).toString("hex");
  const hashedEmailToken = crypto.createHash("sha256").update(rawEmailToken).digest("hex");
  const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

  const user = await createUser(name, email, hashedPassword, hashedEmailToken, emailVerificationExpires, language);
  const verifyUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email/${rawEmailToken}`;

  await sendEmail({
    to: user.email,
    subject: await tService.t("VERIFY_EMAIL_SUBJECT", language),
    html: `<p>${await tService.t("HELLO", language)} ${user.name}, ${await tService.t("VERIFY_EMAIL_BODY", language)} <a href="${verifyUrl}">here</a>.</p>`,
  });

  res.status(201).json({
    success: true,
    message: await tService.t("USER_CREATED_VERIFY_EMAIL", language),
    user: { id: user.id, name: user.name, email: user.email, language: user.language },
    ...(process.env.NODE_ENV === "development" && { verificationToken: rawEmailToken }),
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await verifyUserEmail(hashed);
  if (!user) throw new AppError(await tService.t("INVALID_EXPIRED_TOKEN", user?.language || "en"), 400);
  res.json({ success: true, message: await tService.t("EMAIL_VERIFIED", user.language) });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await findUserByEmail(email);
  if (!user) throw new AppError(await tService.t("INVALID_CREDENTIALS", "en"), 401);
  if (!user.is_verified) throw new AppError(await tService.t("EMAIL_NOT_VERIFIED", user.language), 403);
  if (user.lock_until && user.lock_until > Date.now()) throw new AppError(await tService.t("ACCOUNT_LOCKED", user.language), 423);

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const attempts = await incrementLoginAttempts(user.id);
    if (attempts >= MAX_ATTEMPTS) await lockAccount(user.id, Date.now() + LOCK_TIME);
    throw new AppError(await tService.t("INVALID_CREDENTIALS", user.language), 401);
  }

  await resetLoginAttempts(user.id);
  const accessToken = generateAccessToken(user);
  const refreshRaw = generateRefreshToken(user);
  const hashedRefresh = await bcrypt.hash(refreshRaw, 10);
  await saveRefreshToken(user.id, hashedRefresh);
  res.cookie("refreshToken", refreshRaw, cookieOptions);
  res.json({ success: true, accessToken, language: user.language });
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) throw new AppError(await tService.t("NOT_AUTHENTICATED", "en"), 401);

  let decoded;
  try { decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET); } catch { throw new AppError(await tService.t("INVALID_EXPIRED_TOKEN", "en"), 401); }

  const user = await findUserById(decoded.id);
  if (!user) throw new AppError(await tService.t("USER_NOT_FOUND", "en"), 404);
  if (decoded.tokenVersion !== user.token_version) throw new AppError(await tService.t("TOKEN_REVOKED", user.language), 403);

  const stored = await findRefreshTokenByUserId(user.id);
  if (!stored) throw new AppError(await tService.t("TOKEN_MISMATCH", user.language), 403);
  const match = await bcrypt.compare(token, stored);
  if (!match) throw new AppError(await tService.t("TOKEN_MISMATCH", user.language), 403);

  const newAccess = generateAccessToken(user);
  const newRefreshRaw = generateRefreshToken(user);
  const newHashed = await bcrypt.hash(newRefreshRaw, 10);
  await saveRefreshToken(user.id, newHashed);
  res.cookie("refreshToken", newRefreshRaw, cookieOptions);
  res.json({ success: true, accessToken: newAccess });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      await incrementTokenVersion(decoded.id);
      await deleteRefreshToken(decoded.id);
    } catch {}
  }
  res.clearCookie("refreshToken", cookieOptions);
  res.json({ success: true, message: await tService.t("LOGGED_OUT_EVERYWHERE", "en") });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await findUserByEmail(email);

  if (user) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expires = Date.now() + 10 * 60 * 1000;
    await savePasswordResetToken(user.id, hashedToken, expires);

    const resetUrl = `${process.env.NEXT_PUBLIC_API_URL}/reset-password/${rawToken}`;
    await sendResetPasswordEmail(user.email, resetUrl, user.name);

    if (process.env.NODE_ENV === "development") return res.json({ success: true, resetToken: rawToken });
  }

  res.json({ success: true, message: await tService.t("RESET_PASSWORD_SENT_IF_EXISTS", "en") });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const user = await findUserByResetToken(hashed);
  if (!user) throw new AppError(await tService.t("INVALID_EXPIRED_TOKEN", "en"), 400);

  const newHashedPassword = await bcrypt.hash(newPassword, 12);
  await updateUserPassword(user.id, newHashedPassword);
  await clearPasswordResetToken(user.id);

  res.json({ success: true, message: await tService.t("PASSWORD_UPDATED", user.language) });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) throw new AppError(await tService.t("USER_NOT_FOUND", "en"), 404);
  res.json({ success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role, language: user.language } });
});

const setLanguage = asyncHandler(async (req, res) => {
  const { language } = req.body;
  if (!language) throw new AppError(await tService.t("LANGUAGE_REQUIRED", "en"), 400);
  await updateUserLanguage(req.user.id, language);
  res.json({ success: true, message: await tService.t("LANGUAGE_UPDATED", language), language });
});

module.exports = { register, verifyEmail, login, refreshToken, logout, forgotPassword, resetPassword, getProfile, setLanguage };