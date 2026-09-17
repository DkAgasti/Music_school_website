import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(filePathOrBase64, folder) {
  const result = await cloudinary.uploader.upload(filePathOrBase64, { folder });
  return result.secure_url;
}
