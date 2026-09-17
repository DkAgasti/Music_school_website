import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listStudents, getStudent, updateStudent } from "../controllers/student.controller.js";

const router = Router();

router.get("/", requireAuth, listStudents);
router.get("/:id", requireAuth, getStudent);
router.patch("/:id", requireAuth, updateStudent);

export default router;
