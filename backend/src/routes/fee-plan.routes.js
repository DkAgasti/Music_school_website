import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listFeePlans,
  createFeePlan,
  updateFeePlan,
  deleteFeePlan,
} from "../controllers/fee-plan.controller.js";

const router = Router();

router.get("/", requireAuth, listFeePlans);
router.post("/", requireAuth, createFeePlan);
router.patch("/:id", requireAuth, updateFeePlan);
router.delete("/:id", requireAuth, deleteFeePlan);

export default router;
