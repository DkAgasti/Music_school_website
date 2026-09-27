import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { prisma } from "../config/db.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, "Missing bearer token"));
  }

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
  }
}

// The JWT itself only proves who the student is, not whether their account
// is still active — a token issued before an admin deactivates them stays
// validly signed for its full 30-day life. So this checks `active` in the DB
// on every request; the moment an admin toggles a student off, their very
// next request (and the frontend's 401 interceptor) kicks them straight out.
export async function requireStudentAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, "Missing bearer token"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== "student") {
      return next(new ApiError(401, "Invalid token"));
    }

    const student = await prisma.student.findUnique({
      where: { id: decoded.id },
      select: { active: true },
    });
    if (!student || !student.active) {
      return next(new ApiError(401, "Your account has been deactivated"));
    }

    req.student = decoded;
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
  }
}

// For endpoints shared by both portals (e.g. image upload) — accepts either
// an admin or a student token, and sets req.admin/req.student accordingly.
export function requireAnyAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, "Missing bearer token"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type === "student") {
      req.student = decoded;
    } else {
      req.admin = decoded;
    }
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
  }
}
