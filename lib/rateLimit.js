/**
 * High-performance In-Memory Sliding-Window Rate Limiter
 * Protects Next.js API Routes from automated spam, bot flooding, and DoS
 */

// In-memory store: Map<key, Array<timestamp>>
const rateLimitStore = new Map();

// Periodic garbage collection every 60 seconds to prevent memory buildup
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of rateLimitStore.entries()) {
      const active = timestamps.filter((t) => now - t < 120000);
      if (active.length === 0) {
        rateLimitStore.delete(key);
      } else {
        rateLimitStore.set(key, active);
      }
    }
  }, 60000);
}

/**
 * Checks if a given identifier has exceeded its rate limit
 * @param {string} identifier - Client IP or unique user identifier
 * @param {number} limit - Maximum allowed requests in the window
 * @param {number} windowMs - Window duration in milliseconds (default 60s)
 * @returns {{ success: boolean, limit: number, remaining: number, resetSeconds: number }}
 */
export function checkRateLimit(identifier, limit = 20, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;

  const userRequests = rateLimitStore.get(identifier) || [];
  // Retain only requests within the active window
  const activeRequests = userRequests.filter((timestamp) => timestamp > windowStart);

  if (activeRequests.length >= limit) {
    const oldestTimestamp = activeRequests[0];
    const resetSeconds = Math.max(1, Math.ceil((oldestTimestamp + windowMs - now) / 1000));
    return {
      success: false,
      allowed: false,
      limit,
      remaining: 0,
      resetSeconds,
      resetIn: resetSeconds * 1000,
    };
  }

  // Record this request
  activeRequests.push(now);
  rateLimitStore.set(identifier, activeRequests);

  const resetSec = Math.ceil(windowMs / 1000);
  return {
    success: true,
    allowed: true,
    limit,
    remaining: limit - activeRequests.length,
    resetSeconds: resetSec,
    resetIn: resetSec * 1000,
  };
}

/**
 * Extracts client IP from request headers (supports proxies like Vercel, Cloudflare, local)
 */
export function getClientIp(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}
