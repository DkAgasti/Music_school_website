import { prisma } from "../config/db.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cached, invalidate } from "../utils/cache.js";

const TTL = 60_000;

export const listGalleryImages = asyncHandler(async (req, res) => {
  const { category, page, limit } = req.query;
  const where = category && category !== "All" ? { category } : {};

  // No `page` param → unpaginated array, kept for existing callers (public site).
  if (!page) {
    const images = await cached(`gallery:${category || "all"}`, TTL, () =>
      prisma.galleryImage.findMany({ where, orderBy: { createdAt: "desc" } })
    );
    return ApiResponse(res, 200, images);
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 24));

  const [items, total] = await Promise.all([
    prisma.galleryImage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    }),
    prisma.galleryImage.count({ where }),
  ]);

  return ApiResponse(res, 200, {
    items,
    total,
    page: pageNum,
    limit: pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
});

export const uploadGalleryImage = asyncHandler(async (req, res, next) => {
  const { url, caption, category = "Recitals" } = req.body;
  if (!url) return next(new ApiError(400, "url is required"));

  const image = await prisma.galleryImage.create({
    data: { url, caption, category },
  });
  invalidate("gallery");
  return ApiResponse(res, 201, image);
});

export const deleteGalleryImage = asyncHandler(async (req, res, next) => {
  const existing = await prisma.galleryImage.findUnique({ where: { id: req.params.id } });
  if (!existing) return next(new ApiError(404, "Gallery image not found"));

  await prisma.galleryImage.delete({ where: { id: req.params.id } });
  invalidate("gallery");
  return ApiResponse(res, 200, { id: req.params.id });
});
