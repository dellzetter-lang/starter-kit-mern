const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const authService = require("./auth.service");
const { env } = require("../../config/env");

const cookieOptions = {
  httpOnly: true,
  sameSite: env.NODE_ENV === "production" ? "none" : "lax",
  secure: env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const sendAuth = (res, statusCode, message, payload) => {
  res.cookie(env.COOKIE_NAME, payload.refreshToken, cookieOptions);
  const response = new ApiResponse(statusCode, message, {
    user: payload.user,
    accessToken: payload.accessToken,
  });
  return res.status(statusCode).json(response.body);
};

const register = asyncHandler(async (req, res) => {
  const payload = await authService.register(req.body);
  return sendAuth(res, 201, "Registration successful", payload);
});

const login = asyncHandler(async (req, res) => {
  const payload = await authService.login(req.body);
  return sendAuth(res, 200, "Login successful", payload);
});

const refreshToken = asyncHandler(async (req, res) => {
  const payload = await authService.refresh(req.cookies[env.COOKIE_NAME]);
  return sendAuth(res, 200, "Token refreshed", payload);
});

const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(env.COOKIE_NAME, cookieOptions);
  const response = new ApiResponse(200, "Logout successful");
  return res.status(200).json(response.body);
});

const getMe = asyncHandler(async (req, res) => {
  const payload = await authService.getMe(req.user.id);
  const response = new ApiResponse(200, "Profile loaded", payload);
  return res.status(200).json(response.body);
});

module.exports = { register, login, refreshToken, logout, getMe };
