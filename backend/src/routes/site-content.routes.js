import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listSiteContent,
  upsertSiteContent,
} from "../controllers/site-content.controller.js";

const router = Router();

router.get("/", listSiteContent);
router.post("/", requireAuth, upsertSiteContent);

export default router;
