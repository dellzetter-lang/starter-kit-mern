const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

const signToken = (payload, secret, expiresIn) =>
  jwt.sign(payload, secret, { expiresIn });

// STARTER-KIT: Access tokens are short-lived because they are readable by JS memory.
const generateAccessToken = (user) =>
  signToken({ sub: user.id, role: user.role }, env.JWT_ACCESS_SECRET, env.ACCESS_TOKEN_EXPIRES_IN);

const generateRefreshToken = (user) =>
  signToken({ sub: user.id }, env.JWT_REFRESH_SECRET, env.REFRESH_TOKEN_EXPIRES_IN);

const verifyAccessToken = (token) => jwt.verify(token, env.JWT_ACCESS_SECRET);

const verifyRefreshToken = (token) => jwt.verify(token, env.JWT_REFRESH_SECRET);

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
