import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadImage } from "../services/upload.service.js";

export const uploadImageHandler = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError(400, "No image file uploaded (expected field name 'image')"));
  }

  const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
  const folder = req.body.folder || "music-school";

  const url = await uploadImage(dataUri, folder);

  return ApiResponse(res, 201, { url });
});
