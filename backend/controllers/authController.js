import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import {
  getWelcomeEmailTemplate,
  getVerificationEmailTemplate,
  getPasswordResetEmailTemplate,
} from "../config/emailTemplates.js";
import { v2 as cloudinary } from "cloudinary";
import { uploadToCloudinary } from "../config/cloudinary.js";

const generateReferralCode = (name) =>
  name.substring(0, 4).toUpperCase() + Math.floor(1000 + Math.random() * 9000);

export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, referredBy } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all the fields" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email or phone already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let avatarUrl = undefined;
    const imageFile = req.file;
    if (imageFile) {
      const imageUpload = await uploadToCloudinary(imageFile.path, "avatars");
      avatarUrl = imageUpload.secure_url;
    }

    const referralCode = generateReferralCode(name);

    const SIGNUP_BONUS = 50;
    const REFERRAL_BONUS = 100;

    const newUser = new User({
      name,
      email,
      phone,
      passwordHash: hashedPassword,
      role,
      avatar: avatarUrl,
      referralCode,
      referredBy: referredBy || null,
      loyaltyPoints: SIGNUP_BONUS, 
    });

    if (referredBy) {
      const referrer = await User.findOne({ referralCode: referredBy });
      if (referrer) {
        referrer.loyaltyPoints += REFERRAL_BONUS;
        await referrer.save();
      }
    }

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, 
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "🎉 Welcome to EventHive!",
      html: getWelcomeEmailTemplate(name, email),
    };
    await transporter.sendMail(mailOptions);

    return res.status(201).json({
      success: true,
      message: `${name} registered successfully`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        referralCode: newUser.referralCode,
        referredBy: newUser.referredBy,
        loyaltyPoints: newUser.loyaltyPoints,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields (email and password) are required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Invalid email or password." });

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // must be true in prod (HTTPS)
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: `${user.name} logged in successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints,
        referralCode: user.referralCode,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      path: "/",
    });
    return res.status(200).json({ success: true, message: "Logged out" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.isAccountVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Account already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hashedOtp = await bcrypt.hash(otp, 10);
    user.verifyOtp = hashedOtp;
    user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "🔐 Verify Your Account - Security Code Inside",
      html: getVerificationEmailTemplate(otp),
    };
    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ success: true, message: "Verification OTP sent successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


export const verifyEmail = async (req, res) => {
  const { otp } = req.body;
  if (!otp) {
    return res.status(400).json({ success: false, message: "OTP required" });
  }

  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.isAccountVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email already verified" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    const isOtpMatch = await bcrypt.compare(otp, user.verifyOtp);
    if (!user.verifyOtp || !isOtpMatch) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const isAuthenticated = (req, res) => {
  try {
    return res.status(200).json({ success: true, message: "User is authenticated" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ success: false, message: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hashedOtp = await bcrypt.hash(otp, 10);
    user.resetOtp = hashedOtp;
    user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "🔒 Password Reset OTP",
      html: getPasswordResetEmailTemplate(otp),
    };
    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ success: true, message: "Password reset OTP sent successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "All fields (Email, OTP, New Password) are required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    const isOtpMatch = await bcrypt.compare(otp, user.resetOtp);
    if (!user.resetOtp || !isOtpMatch) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedPassword; 
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
