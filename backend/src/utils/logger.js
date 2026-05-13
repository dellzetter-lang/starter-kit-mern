const morgan = require("morgan");
const winston = require("winston");
const { env } = require("../config/env");

const logger = winston.createLogger({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format((info) => {
      const { requestId } = require('cls-rtracer').id() || {};
      if (requestId) info.requestId = requestId;
      return info;
    })(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

const httpLogger = morgan(env.NODE_ENV === "production" ? "combined" : "dev", {
  stream: { write: (message) => logger.info(message.trim()) },
});

module.exports = { logger, httpLogger };
