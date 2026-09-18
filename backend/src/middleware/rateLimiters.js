import { rateLimit } from "express-rate-limit";

const rateLimitResponse = {
  statusCode: 429,
  message: "Too many requests. Please try again later.",
};

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: rateLimitResponse,
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    statusCode: 429,
    message: "Too many authentication attempts. Please try again in a few minutes.",
  },
});