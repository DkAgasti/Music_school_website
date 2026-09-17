import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacher.controller.js";

const router = Router();

router.get("/", requireAuth, listTeachers);
router.post("/", requireAuth, createTeacher);
router.patch("/:id", requireAuth, updateTeacher);
router.delete("/:id", requireAuth, deleteTeacher);

export default router;
