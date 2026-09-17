import { prisma } from "../config/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEnquiryAlert } from "../services/email.service.js";

export const createEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await prisma.enquiry.create({ data: req.body });
  await sendEnquiryAlert(process.env.EMAIL_FROM, enquiry);
  return ApiResponse(res, 201, enquiry);
});

export const listEnquiries = asyncHandler(async (req, res) => {
  const enquiries = await prisma.enquiry.findMany({ orderBy: { createdAt: "desc" } });
  return ApiResponse(res, 200, enquiries);
});
