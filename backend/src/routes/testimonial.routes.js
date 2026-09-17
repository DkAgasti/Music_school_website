import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "../controllers/testimonial.controller.js";

const router = Router();

router.get("/", requireAuth, listTestimonials);
router.post("/", requireAuth, createTestimonial);
router.patch("/:id", requireAuth, updateTestimonial);
router.delete("/:id", requireAuth, deleteTestimonial);

export default router;
