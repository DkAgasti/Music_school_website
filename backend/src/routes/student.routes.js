import { Router } from "express";
import { requireAuth, requireStudentAuth } from "../middleware/auth.js";
import {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  getStudentHistory,
  deleteStudent,
  getMyProfile,
  updateMyProfile,
} from "../controllers/student.controller.js";

const router = Router();

// Logged-in Student Portal (email+password login) — must be registered
// before "/:id" so "me" isn't swallowed as an admin :id lookup.
router.get("/me", requireStudentAuth, getMyProfile);
router.patch("/me", requireStudentAuth, updateMyProfile);

// Admin Student Management
router.get("/", requireAuth, listStudents);
router.post("/", requireAuth, createStudent);
router.get("/:id", requireAuth, getStudent);
router.get("/:id/history", requireAuth, getStudentHistory);
router.patch("/:id", requireAuth, updateStudent);
router.delete("/:id", requireAuth, deleteStudent);

export default router;
