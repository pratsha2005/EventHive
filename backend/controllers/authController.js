import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db/index.js";   // ✅ Prisma client
import transporter from "../config/nodemailer.js";
import {
  getWelcomeEmailTemplate,
  getVerificationEmailTemplate,
  getPasswordResetEmailTemplate,
} from "../config/emailTemplates.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

const generateReferralCode = (name) =>
  name.substring(0, 4).toUpperCase() + Math.floor(1000 + Math.random() * 9000);

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, referredBy } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ success: false, message: "Please fill all the fields" });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email or phone already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let avatarUrl;
    if (req.file) {
      const imageUpload = await uploadToCloudinary(req.file.path, "avatars");
      avatarUrl = imageUpload.secure_url;
    }

    const referralCode = generateReferralCode(name);

    const SIGNUP_BONUS = 50;
    const REFERRAL_BONUS = 100;

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash: hashedPassword,
        role,
        avatar: avatarUrl,
        referralCode,
        referredBy: referredBy || null,
        loyaltyPoints: SIGNUP_BONUS,
      },
    });

    if (referredBy) {
      await prisma.user.updateMany({
        where: { referralCode: referredBy },
        data: { loyaltyPoints: { increment: REFERRAL_BONUS } },
      });
    }

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "🎉 Welcome to EventHive!",
      html: getWelcomeEmailTemplate(name, email),
    });

    return res.status(201).json({
      success: true,
      message: `${name} registered successfully`,
      user: {
        id: newUser.id,
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

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ success: false, message: "Invalid email or password." });

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid)
      return res.status(400).json({ success: false, message: "Invalid email or password." });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: `${user.name} logged in successfully`,
      user: {
        id: user.id,
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

// LOGOUT
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

// SEND VERIFY OTP
export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.isAccountVerified) {
      return res.status(400).json({ success: false, message: "Account already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hashedOtp = await bcrypt.hash(otp, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        verifyOtp: hashedOtp,
        verifyOtpExpireAt: BigInt(Date.now() + 10 * 60 * 1000),
      },
    });

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "🔐 Verify Your Account - Security Code Inside",
      html: getVerificationEmailTemplate(otp),
    });

    return res.status(200).json({ success: true, message: "Verification OTP sent successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// VERIFY EMAIL
export const verifyEmail = async (req, res) => {
  const { otp } = req.body;
  if (!otp) {
    return res.status(400).json({ success: false, message: "OTP required" });
  }

  try {
    const userId = req.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.isAccountVerified) {
      return res.status(400).json({ success: false, message: "Email already verified" });
    }

    if (user.verifyOtpExpireAt && Number(user.verifyOtpExpireAt) < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    const isOtpMatch = await bcrypt.compare(otp, user.verifyOtp || "");
    if (!user.verifyOtp || !isOtpMatch) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isAccountVerified: true, verifyOtp: "", verifyOtpExpireAt: BigInt(0) },
    });

    return res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// CHECK AUTH
export const isAuthenticated = (req, res) => {
  try {
    return res.status(200).json({ success: true, message: "User is authenticated" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// SEND RESET OTP
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hashedOtp = await bcrypt.hash(otp, 10);

    await prisma.user.update({
      where: { email },
      data: {
        resetOtp: hashedOtp,
        resetOtpExpireAt: BigInt(Date.now() + 10 * 60 * 1000),
      },
    });

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "🔒 Password Reset OTP",
      html: getPasswordResetEmailTemplate(otp),
    });

    return res.status(200).json({ success: true, message: "Password reset OTP sent successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "All fields (Email, OTP, New Password) are required",
    });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.resetOtpExpireAt && Number(user.resetOtpExpireAt) < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    const isOtpMatch = await bcrypt.compare(otp, user.resetOtp || "");
    if (!user.resetOtp || !isOtpMatch) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { passwordHash: hashedPassword, resetOtp: "", resetOtpExpireAt: BigInt(0) },
    });

    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
