const app = require("./src/app");
const connectDB = require("./src/config/db");
const { env } = require("./src/config/env");
const { logger } = require("./src/utils/logger");

const startServer = async () => {
  try {
    await connectDB();
    app.listen(env.PORT, () => {
      logger.info(`API listening on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", reason);
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down.");
  process.exit(0);
});

startServer();
