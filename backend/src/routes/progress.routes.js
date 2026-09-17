import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { addProgressNote, listProgress } from "../controllers/progress.controller.js";

const router = Router();

router.get("/", requireAuth, listProgress);
router.post("/", requireAuth, addProgressNote);

export default router;
