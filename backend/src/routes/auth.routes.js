import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  login,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", requireAuth, getMe);
router.post("/change-password", requireAuth, changePassword);

export default router;
