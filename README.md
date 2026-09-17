# Music School

Next.js frontend (UI only) + Node/Express backend (all APIs).

## Local dev

Backend: `http://localhost:8000`
Frontend: `http://localhost:3000`

```bash
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

## Structure

- `frontend/` — Next.js app router UI. No API routes, no direct DB access. All data via `lib/api.js` → backend.
- `backend/` — Express API. Route → Controller → Service layering. Every route is mounted under `/api/`.

See conventions in the original project spec for auth, Razorpay, and secrets handling.
# Music_school_website
