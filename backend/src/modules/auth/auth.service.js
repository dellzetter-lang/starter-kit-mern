const ApiError = require("../../utils/ApiError");
const User = require("./auth.model");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../../utils/tokenUtils");

const getAuthPayload = (user) => ({
  user: user.toSafeObject(),
  accessToken: generateAccessToken(user),
  refreshToken: generateRefreshToken(user),
});

const register = async (payload) => {
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) throw new ApiError(409, "Email is already registered");

  // TODO: Customize - attach tenant/project defaults here.
  const user = await User.create(payload);
  return getAuthPayload(user);
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) throw new ApiError(403, "Account is disabled");
  return getAuthPayload(user);
};

const refresh = async (refreshToken) => {
  if (!refreshToken) throw new ApiError(401, "Refresh token is missing");

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await User.findById(decoded.sub);
  if (!user || !user.isActive) throw new ApiError(401, "Invalid refresh token");

  return getAuthPayload(user);
};

const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.isActive) throw new ApiError(404, "User not found");
  return {
    user: user.toSafeObject(),
    accessToken: generateAccessToken(user),
  };
};

module.exports = { register, login, refresh, getMe };
