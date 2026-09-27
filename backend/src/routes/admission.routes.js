import { Router } from "express";
import { requireAuth, requireStudentAuth } from "../middleware/auth.js";
import {
  createAdmission,
  listAdmissions,
  getAdmissionById,
  updateAdmissionStatus,
  deleteAdmission,
  applyForAdditionalClass,
} from "../controllers/admission.controller.js";

const router = Router();

router.post("/", createAdmission);
router.post("/mine", requireStudentAuth, applyForAdditionalClass);
router.get("/", requireAuth, listAdmissions);
router.get("/:id", requireAuth, getAdmissionById);

router.patch("/:id/status", requireAuth, updateAdmissionStatus);
router.delete("/:id", requireAuth, deleteAdmission);

export default router;
