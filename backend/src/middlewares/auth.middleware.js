const ApiError = require("../utils/ApiError");
const User = require("../modules/auth/auth.model");
const asyncHandler = require("../utils/asyncHandler");
const { env } = require("../config/env");
const { verifyAccessToken, verifyRefreshToken } = require("../utils/tokenUtils");

const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) throw new ApiError(401, "Access token is required");

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    throw new ApiError(401, "Invalid access token");
  }

  const user = await User.findById(decoded.sub);
  if (!user || !user.isActive) throw new ApiError(401, "Invalid access token");

  req.user = { id: user.id, role: user.role };
  next();
});

const authenticateSession = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const accessToken = header.startsWith("Bearer ") ? header.slice(7) : null;
  const refreshToken = req.cookies?.[env.COOKIE_NAME];
  let decoded;

  try {
    decoded = accessToken ? verifyAccessToken(accessToken) : verifyRefreshToken(refreshToken);
  } catch {
    if (!refreshToken) throw new ApiError(401, "Session is not authenticated");
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiError(401, "Session is not authenticated");
    }
  }

  try {
    const user = await User.findById(decoded.sub);
    if (!user || !user.isActive) throw new Error("Inactive user");
    req.user = { id: user.id, role: user.role };
    next();
  } catch {
    throw new ApiError(401, "Session is not authenticated");
  }
});

const requireRole = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user?.role)) {
    return next(new ApiError(403, "You do not have permission to access this resource"));
  }

  return next();
};

module.exports = { authenticate, authenticateSession, requireRole };
