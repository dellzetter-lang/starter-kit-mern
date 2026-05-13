const { env } = require("../config/env");
const { logger } = require("../utils/logger");

const errorMiddleware = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Internal server error";

  if (statusCode >= 500) logger.error(err);

  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    stack: env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorMiddleware;
