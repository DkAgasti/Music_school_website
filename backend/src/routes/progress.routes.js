import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  addProgressNote,
  listProgress,
  updateProgressNote,
  deleteProgressNote,
} from "../controllers/progress.controller.js";

const router = Router();

router.get("/", requireAuth, listProgress);
router.post("/", requireAuth, addProgressNote);

router.patch("/:id", requireAuth, updateProgressNote);
router.delete("/:id", requireAuth, deleteProgressNote);

export default router;
