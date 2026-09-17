import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import publicRoutes from "./routes/public.routes.js";
import admissionRoutes from "./routes/admission.routes.js";
import studentRoutes from "./routes/student.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import classRoutes from "./routes/class.routes.js";
import feePlanRoutes from "./routes/fee-plan.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import galleryRoutes from "./routes/gallery.routes.js";
import testimonialRoutes from "./routes/testimonial.routes.js";
import siteContentRoutes from "./routes/site-content.routes.js";
import enquiryRoutes from "./routes/enquiry.routes.js";
import shopRoutes from "./routes/shop.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import cronRoutes from "./routes/cron.routes.js";

import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));

// Razorpay webhook needs the raw body for signature verification, so it
// must be mounted before the global express.json() body parser.
app.use("/api/webhooks", webhookRoutes);

app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api", publicRoutes);
app.use("/api/admissions", admissionRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/fee-plans", feePlanRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/site-content", siteContentRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/cron", cronRoutes);

app.use(errorHandler);

export default app;
