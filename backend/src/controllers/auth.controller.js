import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendPasswordResetEmail } from "../services/email.service.js";

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ApiError(400, "Email and password are required"));
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
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

  const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } });
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

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ApiError(400, "Email is required"));
  }

  const admin = await prisma.admin.findUnique({ where: { email } });

  // Security best practice: don't reveal if user exists or not to prevent user enumeration
  if (!admin) {
    return ApiResponse(res, 200, {
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  }

  // Generate short-lived reset token (15 mins)
  const resetToken = jwt.sign(
    { id: admin.id, email: admin.email, type: "RESET_PASSWORD" },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  await sendPasswordResetEmail(admin.email, resetToken);

  return ApiResponse(res, 200, {
    message: "If an account with that email exists, a password reset link has been sent.",
    // Return resetToken in non-production/development to make Postman testing easy
    testResetToken: resetToken,
  });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return next(new ApiError(400, "token and newPassword are required"));
  }

  if (newPassword.length < 6) {
    return next(new ApiError(400, "Password must be at least 6 characters"));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return next(new ApiError(400, "Invalid or expired password reset token"));
  }

  if (decoded.type !== "RESET_PASSWORD") {
    return next(new ApiError(400, "Invalid token type"));
  }

  const admin = await prisma.admin.findUnique({ where: { id: decoded.id } });
  if (!admin) return next(new ApiError(404, "User account not found"));

  const newHash = await bcrypt.hash(newPassword, 12);
  await prisma.admin.update({
    where: { id: admin.id },
    data: { passwordHash: newHash },
  });

  return ApiResponse(res, 200, {
    message: "Password has been successfully reset! You can now log in with your new password.",
  });
});
