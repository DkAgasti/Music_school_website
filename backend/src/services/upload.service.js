import { v2 as cloudinary } from "cloudinary";

// Reads CLOUDINARY_URL (format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME)
// automatically since no explicit config object is passed.
cloudinary.config();

export async function uploadImage(filePathOrBase64, folder) {
  if (!process.env.CLOUDINARY_URL) {
    throw new Error("CLOUDINARY_URL is not configured — cannot upload images yet.");
  }
  const result = await cloudinary.uploader.upload(filePathOrBase64, { folder });
  return result.secure_url;
}
