import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listGalleryImages,
  uploadGalleryImage,
  deleteGalleryImage,
} from "../controllers/gallery.controller.js";

const router = Router();

router.get("/", requireAuth, listGalleryImages);
router.post("/", requireAuth, uploadGalleryImage);
router.delete("/:id", requireAuth, deleteGalleryImage);

export default router;
