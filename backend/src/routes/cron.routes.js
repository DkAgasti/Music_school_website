import { Router } from "express";
import { ApiError } from "../utils/ApiError.js";
import { runFeeDueReminders } from "../services/feeReminder.service.js";

const router = Router();

function requireCronSecret(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (token !== process.env.CRON_SECRET) {
    return next(new ApiError(401, "Invalid cron secret"));
  }
  next();
}

router.get("/ping", requireCronSecret, (req, res) => {
  res.json({ success: true, ranAt: new Date().toISOString() });
});

// For deployments where the backend isn't a single always-on process (e.g.
// serverless) — point an external scheduler (cron-job.org, Vercel Cron,
// GitHub Actions, etc.) at this once a day instead of relying on the
// in-process node-cron schedule in src/index.js.
router.get("/fee-reminders", requireCronSecret, async (req, res, next) => {
  try {
    const sentCount = await runFeeDueReminders();
    res.json({ success: true, ranAt: new Date().toISOString(), sentCount });
  } catch (err) {
    next(new ApiError(500, err.message));
  }
});

export default router;
