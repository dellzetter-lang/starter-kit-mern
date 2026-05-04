const rateLimit = require("express-rate-limit");
const { env } = require("../config/env");

const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many auth requests. Please try again later.",
    statusCode: 429,
  },
});

module.exports = { authRateLimiter };
