import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createEnquiry, listEnquiries } from "../controllers/enquiry.controller.js";

const router = Router();

router.post("/", createEnquiry);
router.get("/", requireAuth, listEnquiries);

export default router;
