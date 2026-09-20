import { Router } from "express";
import {
  listClasses,
  getClassBySlug,
  listTeachers,
  listTestimonials,
  listGalleryImages,
  getPublicSiteContent,
} from "../controllers/public.controller.js";

const router = Router();

router.get("/classes", listClasses);
router.get("/classes/:slug", getClassBySlug);
router.get("/teachers", listTeachers);
router.get("/testimonials", listTestimonials);
router.get("/gallery", listGalleryImages);
router.get("/site-content", getPublicSiteContent);

export default router;
