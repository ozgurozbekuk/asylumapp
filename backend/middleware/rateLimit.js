import RateLimitBucket from "../models/RateLimitBucket.js";

// In-memory limiter is acceptable for single-instance deployments.
// For horizontal scaling, replace this with a shared store (e.g. Redis).
const WINDOW_MS = Math.max(1_000, Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000);
const MAX_REQUESTS = Math.max(1, Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 50);
const STORE_MODE = (process.env.RATE_LIMIT_STORE || "memory").toLowerCase();
const buckets = new Map();

export const getRateLimitKey = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
};

export const rateLimit = (req, res, next) => {
  const key = getRateLimitKey(req);
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const retryAfter = Math.ceil(WINDOW_MS / 1000);

  if (STORE_MODE === "mongo") {
    (async () => {
      const windowStartDate = new Date(windowStart);
      const expiresAt = new Date(now + WINDOW_MS * 2);

      let bucket = await RateLimitBucket.findOne({
        key,
        windowStart: { $gt: windowStartDate },
      })
        .sort({ windowStart: -1 })
        .exec();

      if (!bucket) {
        bucket = await RateLimitBucket.create({
          key,
          count: 1,
          windowStart: new Date(now),
          expiresAt,
        });
      } else {
        bucket.count += 1;
        bucket.expiresAt = expiresAt;
        await bucket.save();
      }

      if (bucket.count > MAX_REQUESTS) {
        res.setHeader("Retry-After", retryAfter);
        return res.status(429).json({ message: "Too many requests. Please slow down." });
      }

      return next();
    })().catch((err) => {
      // eslint-disable-next-line no-console
      console.error("Rate limit store error:", err?.message || err);
      // Fail open to avoid full outage from limiter storage issues.
      return next();
    });
    return;
  }

  const events = (buckets.get(key) || []).filter((timestamp) => timestamp > windowStart);
  events.push(now);
  buckets.set(key, events);

  if (events.length > MAX_REQUESTS) {
    res.setHeader("Retry-After", retryAfter);
    return res.status(429).json({ message: "Too many requests. Please slow down." });
  }

  return next();
};
