import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listEnrollments, createEnrollment, updateEnrollment } from "../controllers/enrollment.controller.js";

const router = Router();

router.get("/", requireAuth, listEnrollments);
router.post("/", requireAuth, createEnrollment);
router.patch("/:id", requireAuth, updateEnrollment);

export default router;
