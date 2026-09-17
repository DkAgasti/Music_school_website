import { Router } from "express";
import { ApiError } from "../utils/ApiError.js";

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

export default router;
