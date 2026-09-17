import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createAdmission,
  listAdmissions,
  updateAdmissionStatus,
} from "../controllers/admission.controller.js";

const router = Router();

router.post("/", createAdmission);
router.get("/", requireAuth, listAdmissions);
router.patch("/:id/status", requireAuth, updateAdmissionStatus);

export default router;
