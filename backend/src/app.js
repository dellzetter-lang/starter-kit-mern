const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const rtracer = require("cls-rtracer");
const helmet = require("helmet");
const { env } = require("./config/env");
const routes = require("./routes");
const swagger = require("./config/swagger");
const errorMiddleware = require("./middlewares/error.middleware");
const notFoundMiddleware = require("./middlewares/notFound.middleware");
const { httpLogger } = require("./utils/logger");

const app = express();

// STARTER-KIT: Keep cross-cutting security and parsing concerns in one app factory.
app.use(rtracer.middleware());
app.use(helmet());
app.use(httpLogger);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.corsOrigins.includes(origin))
        return callback(null, true);
      return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use("/api", routes);
app.use("/api-docs", swagger.serve, swagger.setup);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
