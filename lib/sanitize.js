/**
 * Input Sanitization & Security Validation Utilities
 * Defense against XSS, Parameter Tampering, and Open Redirects
 */

// Strict Twitter handle rules: 1-30 alphanumeric characters plus underscores
const HANDLE_REGEX = /^[a-zA-Z0-9_]{1,30}$/;

// Strict Roast ID pattern: e.g. roast-1234567890 or custom alphanumeric
const ROAST_ID_REGEX = /^roast-[a-zA-Z0-9_-]{1,64}$/;

// Known trusted origins for BountyRoast
const TRUSTED_ORIGIN_PATTERNS = [
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/,
  /^https:\/\/([a-zA-Z0-9_-]+\.)?bountyroast\.lol$/,
];

/**
 * Validates and sanitizes a Twitter / X handle
 * Returns clean handle string without '@' or null if invalid
 */
export function sanitizeHandle(rawHandle) {
  if (!rawHandle || typeof rawHandle !== "string") return null;
  const cleaned = rawHandle.replace(/^@+/, "").trim();
  return HANDLE_REGEX.test(cleaned) ? cleaned : null;
}

/**
 * Sanitizes user-generated text (roast text, comeback text, comments)
 * Strips HTML tags, trims, and enforces max length
 */
export function sanitizeText(rawText, maxLength = 140) {
  if (!rawText || typeof rawText !== "string") return "";

  // 1. Strip HTML tags and control characters
  const stripped = rawText
    .replace(/<[^>]*>?/gm, "") // remove HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // remove control chars
    .trim();

  // 2. Enforce length boundary
  return stripped.slice(0, maxLength);
}

/**
 * Validates a monetary amount (bounty, fuel, clear cost)
 * Ensures positive, finite, reasonable numeric boundaries
 */
export function validateAmount(rawAmount, min = 1, max = 10000) {
  const num = Number(rawAmount);
  if (!Number.isFinite(num) || isNaN(num)) return null;
  if (num < min || num > max) return null;

  // Round to exact 2 decimal places to prevent floating point exploit
  return Math.round(num * 100) / 100;
}

/**
 * Validates roast ID format
 */
export function validateRoastId(rawId) {
  if (!rawId || typeof rawId !== "string") return null;
  const trimmed = rawId.trim();
  return ROAST_ID_REGEX.test(trimmed) ? trimmed : null;
}

/**
 * Validates request Origin to prevent Open Redirect attacks in Stripe success/cancel URLs
 */
export function getSafeOrigin(req, fallback = "http://localhost:3000") {
  const originHeader = req.headers.get("origin");
  const hostHeader = req.headers.get("host");

  const candidate = originHeader || (hostHeader ? `http://${hostHeader}` : null);

  if (candidate) {
    try {
      const url = new URL(candidate);
      const fullOrigin = `${url.protocol}//${url.host}`;
      const isAllowed = TRUSTED_ORIGIN_PATTERNS.some((pattern) =>
        pattern.test(fullOrigin)
      );

      if (isAllowed) return fullOrigin;
    } catch {
      // invalid URL structure
    }
  }

  // Use configured SITE_URL in production, or fallback for localhost
  return process.env.NEXT_PUBLIC_SITE_URL || fallback;
}
