import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { login } from "../controllers/auth.controller.js";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post("/login", validate(loginSchema), login);

export default router;
