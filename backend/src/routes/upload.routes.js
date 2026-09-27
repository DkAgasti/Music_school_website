import { Router } from "express";
import multer from "multer";
import { requireAnyAuth } from "../middleware/auth.js";
import { uploadImageHandler } from "../controllers/upload.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const router = Router();

router.post("/image", requireAnyAuth, upload.single("image"), uploadImageHandler);

export default router;
