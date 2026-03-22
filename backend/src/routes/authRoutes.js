const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const { firebaseLogin } = require("../controllers/firebaseAuthController")
const { protect, authorize } = require("../middleware/authMiddleware")
const { authLimiter, loginLimiter } = require("../middleware/rateLimit")
const validate = require("../middleware/validate")
const { registerSchema, loginSchema, resetPasswordSchema } = require("../validators/authValidator")

router.use(authLimiter)

console.log("authLimiter =", typeof authLimiter)
console.log("loginLimiter =", typeof loginLimiter)
console.log("validate(registerSchema) =", typeof validate(registerSchema))
console.log("authController.register =", typeof authController.register)

router.post("/register", loginLimiter, validate(registerSchema), authController.register)
router.get("/verify-email/:token", authController.verifyEmail)
router.post("/login", loginLimiter, validate(loginSchema), authController.login)
router.post("/firebase-login", firebaseLogin)
router.post("/refresh", authController.refreshToken)
router.post("/forgot-password", loginLimiter, authController.forgotPassword)
router.post("/reset-password", loginLimiter, validate(resetPasswordSchema), authController.resetPassword)
router.post("/logout", protect, authController.logout)
router.post("/set-language", protect, authController.setLanguage)

router.get("/my-country", protect, (req, res) => {
  res.json({
    success: true,
    user: req.user?.id,
    ip: req.clientIP,
    country: req.country,
    profile: req.geoProfile || null
  })
})

router.get("/me", protect, authController.getProfile)

router.get("/admin-test", protect, authorize("admin"), (req, res) => {
  res.json({
    success: true,
    message: "Admin access granted 👑",
    country: req.country
  })
})

module.exports = router