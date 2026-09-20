import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  createEnquiry,
  listEnquiries,
  toggleEnquiryHandled,
  deleteEnquiry,
} from "../controllers/enquiry.controller.js";

const router = Router();

router.post("/", createEnquiry);
router.get("/", requireAuth, listEnquiries);
router.patch("/:id/handle", requireAuth, toggleEnquiryHandled);
router.delete("/:id", requireAuth, deleteEnquiry);

export default router;
