import { prisma } from "../config/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listSiteContent = asyncHandler(async (req, res) => {
  const content = await prisma.siteContent.findMany({ orderBy: { key: "asc" } });
  return ApiResponse(res, 200, content);
});

export const upsertSiteContent = asyncHandler(async (req, res) => {
  const { key, value } = req.body;
  const content = await prisma.siteContent.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  return ApiResponse(res, 200, content);
});
