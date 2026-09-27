import "dotenv/config";
import cron from "node-cron";
import app from "./app.js";
import { prisma } from "./config/db.js";
import { runFeeDueReminders } from "./services/feeReminder.service.js";

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});

// Pre-warm the DB connection pool at boot instead of letting the first
// concurrent burst of requests each pay a fresh TCP+TLS connection-setup
// cost (measured: 2 "parallel" queries on a cold pool took LONGER than the
// same 2 queries run one after another, because each one opened its own new
// connection instead of reusing a pooled one). Firing several trivial
// queries in parallel right now forces Prisma to open that many real
// connections up front, so real traffic hits an already-warm pool.
const WARM_UP_QUERIES = 6;
Promise.all(Array.from({ length: WARM_UP_QUERIES }, () => prisma.$queryRaw`SELECT 1`))
  .then(() => console.log(`DB connection pool warmed up (${WARM_UP_QUERIES} connections).`))
  .catch((err) => console.warn("DB warm-up failed (will connect lazily instead):", err.message));

// Daily fee-due reminder emails (5/3/1 days before due, then every day
// overdue) — works automatically as long as this process stays running. On
// a serverless deployment where it doesn't, use the equivalent
// /api/cron/fee-reminders route with an external scheduler instead; running
// both would just double-send on days they happen to overlap, so pick one.
cron.schedule("0 9 * * *", () => {
  runFeeDueReminders()
    .then((sentCount) => console.log(`[Cron] Fee due reminders sent: ${sentCount}`))
    .catch((err) => console.error("[Cron] Fee due reminders failed:", err.message));
});
