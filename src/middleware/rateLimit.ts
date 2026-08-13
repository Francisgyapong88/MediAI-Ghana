import rateLimit from "express-rate-limit";

/**
 * Limits repeated login attempts — protects against credential-stuffing /
 * brute-force, and is explicit evidence required by Chapter Three NFR-01.
 */
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "TooManyRequests", message: "Too many login attempts. Please try again later." },
});

/**
 * Limits prediction requests per client — prevents abuse of the (eventually
 * real, compute-costly) model endpoint.
 */
export const predictRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "TooManyRequests", message: "Too many prediction requests. Please slow down." },
});