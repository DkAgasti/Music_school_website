import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listAdminClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  listBatches,
  createBatch,
  updateBatch,
  deleteBatch,
} from "../controllers/class.controller.js";

const router = Router();

// Batches & Timing CRUD
router.get("/batches/all", listBatches);
router.post("/batches", requireAuth, createBatch);
router.patch("/batches/:id", requireAuth, updateBatch);
router.delete("/batches/:id", requireAuth, deleteBatch);

// Classes CRUD
router.get("/", listAdminClasses);
router.get("/:id", getClassById);
router.post("/", requireAuth, createClass);
router.patch("/:id", requireAuth, updateClass);
router.delete("/:id", requireAuth, deleteClass);

export default router;
