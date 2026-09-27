import { Router } from "express";
import {
  listClasses,
  getClassBySlug,
  listTeachers,
  listTestimonials,
  getPublicSiteContent,
} from "../controllers/public.controller.js";

const router = Router();

router.get("/classes", listClasses);
router.get("/classes/:slug", getClassBySlug);
router.get("/teachers", listTeachers);
router.get("/testimonials", listTestimonials);
router.get("/site-content", getPublicSiteContent);

export default router;
