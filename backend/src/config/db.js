const mongoose = require("mongoose");
const { env } = require("./env");
const { logger } = require("../utils/logger");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDB = async () => {
  // STARTER-KIT: Retry with backoff for containerized databases that boot slowly.
  for (let attempt = 1; attempt <= env.MONGO_MAX_RETRIES; attempt += 1) {
    try {
      await mongoose.connect(env.MONGODB_URI);
      logger.info("MongoDB connected");
      return mongoose.connection;
    } catch (error) {
      logger.error(`MongoDB connection failed (${attempt}/${env.MONGO_MAX_RETRIES})`, error);

      if (attempt === env.MONGO_MAX_RETRIES) {
        throw error;
      }

      await sleep(env.MONGO_RETRY_DELAY_MS * attempt);
    }
  }
};

module.exports = connectDB;
