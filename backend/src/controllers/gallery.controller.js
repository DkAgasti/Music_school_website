import { prisma } from "../config/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listGalleryImages = asyncHandler(async (req, res) => {
  const images = await prisma.galleryImage.findMany({ orderBy: { createdAt: "desc" } });
  return ApiResponse(res, 200, images);
});

export const uploadGalleryImage = asyncHandler(async (req, res) => {
  const image = await prisma.galleryImage.create({ data: req.body });
  return ApiResponse(res, 201, image);
});

export const deleteGalleryImage = asyncHandler(async (req, res) => {
  await prisma.galleryImage.delete({ where: { id: req.params.id } });
  return ApiResponse(res, 200, { id: req.params.id });
});
