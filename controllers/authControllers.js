const User = require("../models/User");
const { sendEmail } = require("../utils/sendEmail");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// Secret key and optional token expiry duration
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN; // Token valid for 1 day

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role || "user" },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    // Set session for form-based auth
    req.session.user = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    // Send token for client-side JS (stored in localStorage)
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Login failed", error: err.message });
  }
};

// FORGOT PASSWORD (send OTP)
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Email not found" });

    const otp = crypto.randomInt(1000, 9999).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await sendEmail(
      email,
      "Your OTP Code",
      `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 30px; background-color: #ffffff;">
    <div style="text-align: center; margin-bottom: 30px;">
      <img src="https://uaes.edu.ng/assets/img/favigon.png" alt="UNIVERSITY OF AGRICULTURE AND ENVIRONMENTAL SCIENCE (UAES), UMUAGWO" style="max-width: 180px; margin-bottom: 10px;" />
      <h2 style="color: #0c8436;">OTP Verification Code</h2>
    </div>

    <p style="font-size: 16px; color: #333;">
      Hello,</p>
    <p style="font-size: 16px; color: #333;">
      Use the One-Time Password (OTP) below to continue your password reset process. This code is valid for a limited time only.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <div style="display: inline-block; padding: 12px 24px; font-size: 28px; font-weight: bold; color: #0c8436; background-color: #f0f4ff; border-radius: 8px; letter-spacing: 8px; border: 1px dashed #0c8436;">
        ${otp}
      </div>
    </div>

    <p style="font-size: 14px; color: #555;">
      If you did not request this code, you can safely ignore this email.
    </p>

    <p style="font-size: 14px; color: #888; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
      UNIVERSITY OF AGRICULTURE AND ENVIRONMENTAL SCIENCE (UAES), UMUAGWO<br />
      Knowledge and Skill for Service <br />
      &copy; ${new Date().getFullYear()} All rights reserved.
    </p>
  </div>
  `,
    );

    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: err.message,
    });
  }
};

// VERIFY OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    res.status(200).json({ success: true, message: "OTP verified" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "OTP verification failed",
      error: err.message,
    });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Password reset failed",
      error: err.message,
    });
  }
};
