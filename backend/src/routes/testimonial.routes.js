import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "../controllers/testimonial.controller.js";

const router = Router();

// NOTE: this router is mounted at "/api/testimonials", but public.routes.js
// (mounted at "/api" first in app.js) already defines its own cached
// "GET /testimonials" handler that always wins for that exact path — so the
// admin listing lives at "/manage/all" instead, same fix as class/teacher
// routes use for the identical collision.
router.get("/manage/all", requireAuth, listTestimonials);
router.post("/", requireAuth, createTestimonial);
router.patch("/:id", requireAuth, updateTestimonial);
router.delete("/:id", requireAuth, deleteTestimonial);

export default router;
