const express = require("express");
const controller = require("./auth.controller");
const validate = require("../../middlewares/validate");
const { authenticateSession } = require("../../middlewares/auth.middleware");
const { authRateLimiter } = require("../../middlewares/rateLimiter");
const { registerSchema, loginSchema } = require("./auth.validator");

const router = express.Router();

// STARTER-KIT: Auth endpoints are rate-limited as a first line of brute-force defense.
router.use(authRateLimiter);
router.post("/register", validate(registerSchema), controller.register);
router.post("/login", validate(loginSchema), controller.login);
router.post("/refresh-token", controller.refreshToken);
router.post("/logout", controller.logout);
router.get("/me", authenticateSession, controller.getMe);

module.exports = router;
