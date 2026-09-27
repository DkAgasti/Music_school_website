// Tiny in-memory cache for read-heavy PUBLIC endpoints (classes, teachers,
// gallery, testimonials, site-content) — these are hit by every visitor to
// the marketing site and rarely change, but each Prisma query pays a real
// network round trip to the DB. A short TTL is just a safety net; the real
// freshness guarantee is that every admin write that touches these
// resources calls invalidate() so changes show up on the NEXT request, not
// after some arbitrary delay.
//
// Not used for admin/student authenticated data — that must always be
// live/correct, and caching it risks showing stale data after a write.

const store = new Map(); // key -> { value, expiresAt }

export async function cached(key, ttlMs, fetcher) {
  const hit = store.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return hit.value;
  }
  const value = await fetcher();
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

// Clears every cache entry whose key starts with `prefix` (e.g. "classes"
// clears both the list and every "classes:<slug>" detail entry).
export function invalidate(prefix) {
  for (const key of store.keys()) {
    if (key === prefix || key.startsWith(`${prefix}:`)) {
      store.delete(key);
    }
  }
}
