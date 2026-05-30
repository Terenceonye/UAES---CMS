const express = require("express");
const router = express.Router();
const authController = require("../controllers/authControllers");
const { protect } = require("../middlewares/authMiddleware");
const {
  validateLogin,
  validateForgotPassword,
  validateVerifyOtp,
  validateResetPassword,
} = require("../middlewares/validation");

// pages
router.get("/verify-email", (req, res) => {
  res.render("verify-email");
});
router.get("/verify-otp", (req, res) => {
  res.render("verify-otp");
});

router.get("/new-password", (req, res) => {
  res.render("new-password");
});

// @route   POST /api/auth/login
router.post("/login", validateLogin, authController.login);

// @route   POST /api/auth/forgot-password
router.post(
  "/api/forgot-password",
  validateForgotPassword,
  authController.forgotPassword
);

// @route   POST /api/auth/verify-otp
router.post("/api/verify-otp", validateVerifyOtp, authController.verifyOtp);

// @route   POST /api/auth/reset-password
router.post(
  "/api/reset-password",
  validateResetPassword,
  authController.resetPassword
);

router.get("/verify", protect, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

module.exports = router;
