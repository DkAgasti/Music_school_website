import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) return next(new ApiError(401, "Invalid credentials"));

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return next(new ApiError(401, "Invalid credentials"));

  const token = jwt.sign(
    { id: admin.id, email: admin.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  return ApiResponse(res, 200, { token, admin: { id: admin.id, name: admin.name, email: admin.email } });
});
