import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createClass,
  updateClass,
  deleteClass,
  createBatch,
  listBatches,
} from "../controllers/class.controller.js";

const router = Router();

router.post("/", requireAuth, createClass);
router.patch("/:id", requireAuth, updateClass);
router.delete("/:id", requireAuth, deleteClass);

router.get("/batches/all", requireAuth, listBatches);
router.post("/batches", requireAuth, createBatch);

export default router;
