const express = require("express");
const router = express.Router();

const {
  register,
  verifyEmail,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getProfile,
  setLanguage,
} = require("../controllers/authController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/register", register);
router.get("/verify-email/:token", verifyEmail);

router.post("/login", login);
router.post("/refresh", refreshToken);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/logout", protect, logout);
router.post("/set-language", protect, setLanguage);

router.get("/my-country", protect, (req, res) => {
  res.json({
    success: true,
    user: req.user?.id,
    ip: req.clientIP,
    country: req.country,
    profile: req.geoProfile || null
  });
});

router.get("/me", protect, getProfile);

router.get("/admin-test", protect, authorize("admin"), (req, res) => {
  res.json({
    success: true,
    message: "Admin access granted 👑",
    country: req.country
  });
});

module.exports = router;
