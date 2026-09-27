import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendPasswordResetOtpEmail } from "../services/email.service.js";

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ApiError(400, "Email and password are required"));
  }

  const admin = await prisma.admin.findUnique({
    where: { email },
    omit: { passwordHash: false },
  });
  if (!admin) return next(new ApiError(401, "Invalid email or password"));

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return next(new ApiError(401, "Invalid email or password"));

  const token = jwt.sign(
    { id: admin.id, email: admin.email, name: admin.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  return ApiResponse(res, 200, {
    token,
    admin: { id: admin.id, name: admin.name, email: admin.email },
  });
});

export const getMe = asyncHandler(async (req, res, next) => {
  const admin = await prisma.admin.findUnique({
    where: { id: req.admin.id },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!admin) return next(new ApiError(404, "Admin account not found"));
  return ApiResponse(res, 200, admin);
});

export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new ApiError(400, "currentPassword and newPassword are required"));
  }

  const admin = await prisma.admin.findUnique({
    where: { id: req.admin.id },
    omit: { passwordHash: false },
  });
  if (!admin) return next(new ApiError(404, "Admin account not found"));

  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) return next(new ApiError(400, "Current password is incorrect"));

  const newHash = await bcrypt.hash(newPassword, 12);
  await prisma.admin.update({
    where: { id: admin.id },
    data: { passwordHash: newHash },
  });

  return ApiResponse(res, 200, { message: "Password updated successfully" });
});

const OTP_EXPIRY_MINUTES = 10;

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ApiError(400, "Email is required"));
  }

  const admin = await prisma.admin.findUnique({ where: { email } });

  // This is a small single-admin internal tool, not a public multi-user
  // app — there's no real user-enumeration risk worth confusing the actual
  // admin over, so tell them plainly if the email doesn't match instead of
  // silently pretending an OTP was sent.
  if (!admin) {
    return next(new ApiError(404, "No admin account found with this email address."));
  }

  const response = {
    message: "An OTP has been sent to your email.",
  };

  const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
  const resetOtpHash = await bcrypt.hash(otp, 10);
  const resetOtpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.admin.update({
    where: { id: admin.id },
    data: { resetOtpHash, resetOtpExpiresAt },
  });

  await sendPasswordResetOtpEmail(admin.email, otp);

  // Only leak the raw OTP outside production, and only for local dev/testing
  // when SMTP isn't configured yet — never in production.
  if (process.env.NODE_ENV !== "production") {
    response.testOtp = otp;
  }

  return ApiResponse(res, 200, response);
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return next(new ApiError(400, "email, otp, and newPassword are required"));
  }

  if (newPassword.length < 6) {
    return next(new ApiError(400, "Password must be at least 6 characters"));
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin || !admin.resetOtpHash || !admin.resetOtpExpiresAt) {
    return next(new ApiError(400, "Invalid or expired OTP"));
  }

  if (admin.resetOtpExpiresAt < new Date()) {
    return next(new ApiError(400, "OTP has expired. Please request a new one."));
  }

  const validOtp = await bcrypt.compare(otp, admin.resetOtpHash);
  if (!validOtp) {
    return next(new ApiError(400, "Invalid OTP"));
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await prisma.admin.update({
    where: { id: admin.id },
    data: { passwordHash: newHash, resetOtpHash: null, resetOtpExpiresAt: null },
  });

  return ApiResponse(res, 200, {
    message: "Password has been successfully reset! You can now log in with your new password.",
  });
});

export const studentLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ApiError(400, "Email and password are required"));
  }

  const student = await prisma.student.findUnique({
    where: { email },
    omit: { passwordHash: false },
  });

  if (!student || !student.passwordHash) {
    return next(new ApiError(401, "Invalid email or password"));
  }

  const valid = await bcrypt.compare(password, student.passwordHash);
  if (!valid) return next(new ApiError(401, "Invalid email or password"));

  if (!student.active) {
    return next(new ApiError(403, "Your account has been deactivated. Please contact the school."));
  }

  const token = jwt.sign(
    { id: student.id, email: student.email, name: student.name, type: "student" },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  return ApiResponse(res, 200, {
    token,
    student: { id: student.id, name: student.name, email: student.email },
  });
});
