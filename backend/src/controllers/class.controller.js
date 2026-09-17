import { prisma } from "../config/db.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createClass = asyncHandler(async (req, res) => {
  const musicClass = await prisma.musicClass.create({ data: req.body });
  return ApiResponse(res, 201, musicClass);
});

export const updateClass = asyncHandler(async (req, res) => {
  const musicClass = await prisma.musicClass.update({
    where: { id: req.params.id },
    data: req.body,
  });
  return ApiResponse(res, 200, musicClass);
});

export const deleteClass = asyncHandler(async (req, res) => {
  await prisma.musicClass.delete({ where: { id: req.params.id } });
  return ApiResponse(res, 200, { id: req.params.id });
});

export const createBatch = asyncHandler(async (req, res) => {
  const batch = await prisma.batch.create({ data: req.body });
  return ApiResponse(res, 201, batch);
});

export const listBatches = asyncHandler(async (req, res) => {
  const batches = await prisma.batch.findMany({ include: { class: true, students: true } });
  return ApiResponse(res, 200, batches);
});
