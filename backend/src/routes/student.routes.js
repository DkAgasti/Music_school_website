import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  getStudentHistory,
  deleteStudent,
  trackStudentProgress,
} from "../controllers/student.controller.js";

const router = Router();

// Public Student Portal: Student checks own attendance & progress by phone or email
router.get("/track", trackStudentProgress);

// Admin Student Management
router.get("/", requireAuth, listStudents);
router.post("/", requireAuth, createStudent);
router.get("/:id", requireAuth, getStudent);
router.get("/:id/history", requireAuth, getStudentHistory);
router.patch("/:id", requireAuth, updateStudent);
router.delete("/:id", requireAuth, deleteStudent);

export default router;
