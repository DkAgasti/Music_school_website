import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEnquiryAlert } from "../services/email.service.js";

export const createEnquiry = asyncHandler(async (req, res, next) => {
  const { name, phone, email, message } = req.body;

  if (!name || !email || !message) {
    return next(new ApiError(400, "name, email, and message are required"));
  }

  const enquiry = await prisma.enquiry.create({
    data: { name, phone, email, message },
  });

  // Non-blocking alert email to admin
  sendEnquiryAlert(process.env.ADMIN_EMAIL, enquiry).catch(() => {});

  return ApiResponse(res, 201, enquiry);
});

export const listEnquiries = asyncHandler(async (req, res) => {
  const { handled } = req.query;

  const where = {};
  if (handled !== undefined) where.handled = handled === "true";

  const enquiries = await prisma.enquiry.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return ApiResponse(res, 200, enquiries);
});

export const toggleEnquiryHandled = asyncHandler(async (req, res, next) => {
  const enquiry = await prisma.enquiry.findUnique({ where: { id: req.params.id } });
  if (!enquiry) return next(new ApiError(404, "Enquiry not found"));

  const updated = await prisma.enquiry.update({
    where: { id: req.params.id },
    data: {
      handled: req.body.handled !== undefined ? Boolean(req.body.handled) : !enquiry.handled,
    },
  });

  return ApiResponse(res, 200, updated);
});

export const deleteEnquiry = asyncHandler(async (req, res, next) => {
  const enquiry = await prisma.enquiry.findUnique({ where: { id: req.params.id } });
  if (!enquiry) return next(new ApiError(404, "Enquiry not found"));

  await prisma.enquiry.delete({ where: { id: req.params.id } });
  return ApiResponse(res, 200, { message: "Enquiry deleted successfully", id: req.params.id });
});
