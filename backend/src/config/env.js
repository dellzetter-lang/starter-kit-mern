const dotenv = require("dotenv");
const Joi = require("joi");

dotenv.config();

// STARTER-KIT: Fail fast so deployment issues are visible before requests arrive.
const schema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "test", "production").default("development"),
  PORT: Joi.number().default(5000),
  MONGODB_URI: Joi.string().required(),
  CLIENT_URL: Joi.string().uri().required(),
  CORS_ORIGINS: Joi.string().required(),
  JWT_ACCESS_SECRET: Joi.string().min(24).required(),
  JWT_REFRESH_SECRET: Joi.string().min(24).required(),
  ACCESS_TOKEN_EXPIRES_IN: Joi.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: Joi.string().default("7d"),
  BCRYPT_SALT_ROUNDS: Joi.number().integer().min(8).max(15).default(12),
  COOKIE_NAME: Joi.string().default("refreshToken"),
  MONGO_MAX_RETRIES: Joi.number().integer().min(1).default(5),
  MONGO_RETRY_DELAY_MS: Joi.number().integer().min(250).default(1000),
  RATE_LIMIT_WINDOW_MS: Joi.number().integer().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: Joi.number().integer().default(100),
}).unknown(true);

const { value, error } = schema.validate(process.env, { abortEarly: false });

if (error) {
  throw new Error(`Environment validation failed: ${error.message}`);
}

const env = {
  ...value,
  corsOrigins: value.CORS_ORIGINS.split(",").map((origin) => origin.trim()),
};

module.exports = { env };
