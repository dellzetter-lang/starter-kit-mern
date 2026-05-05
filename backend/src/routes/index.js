const express = require("express");
const ApiResponse = require("../utils/ApiResponse");
const authRoutes = require("../modules/auth/auth.routes");

const router = express.Router();

router.get("/health", (_req, res) => {
  const response = new ApiResponse(200, "API is healthy", {
    service: "mern-starter-api",
  });
  res.status(200).json(response.body);
});

router.use("/auth", authRoutes);

router.use("/products", require("../modules/products/products.routes"));
module.exports = router;
