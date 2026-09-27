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
router.get("/batches/all", requireAuth, listBatches);
router.post("/batches", requireAuth, createBatch);
router.patch("/batches/:id", requireAuth, updateBatch);
router.delete("/batches/:id", requireAuth, deleteBatch);

// Classes CRUD
// NOTE: bare "/" and "/:id" GETs are intentionally NOT used here — they are
// shadowed by public.routes.js (mounted at "/api" before this router), which
// defines its own "/classes" and "/classes/:slug" GET handlers that always
// win for those exact paths. The admin list/detail (with inactive items,
// counts, full batch/teacher data) lives at these non-colliding paths instead.
router.get("/manage/all", requireAuth, listAdminClasses);
router.get("/manage/:id", requireAuth, getClassById);
router.post("/", requireAuth, createClass);
router.patch("/:id", requireAuth, updateClass);
router.delete("/:id", requireAuth, deleteClass);

export default router;
