import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacher.controller.js";

const router = Router();

// NOTE: bare "/" is shadowed by public.routes.js (mounted at "/api" before
// this router), which defines its own "/teachers" GET handler that always
// wins for that exact path. The admin list (with the classes-taught include)
// lives at this non-colliding path instead.
router.get("/manage/all", requireAuth, listTeachers);
router.post("/", requireAuth, createTeacher);
router.patch("/:id", requireAuth, updateTeacher);
router.delete("/:id", requireAuth, deleteTeacher);

export default router;
