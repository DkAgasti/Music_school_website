import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createAdmission,
  listAdmissions,
  getAdmissionById,
  updateAdmissionStatus,
  deleteAdmission,
} from "../controllers/admission.controller.js";

const router = Router();

router.post("/", createAdmission);
router.get("/", listAdmissions);
router.get("/:id", requireAuth, getAdmissionById);

router.patch("/:id/status", requireAuth, updateAdmissionStatus);
router.delete("/:id", requireAuth, deleteAdmission);

export default router;
