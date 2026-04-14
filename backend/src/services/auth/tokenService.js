const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../../models/User');
const ApiError = require('../../utils/ApiError');
const { AUTH, HTTP } = require('../../config/constants');

// ── GENERATE ACCESS TOKEN ──────────────────────────────────────────
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || AUTH.ACCESS_TOKEN_EXPIRY,
  });
};

// ── GENERATE REFRESH TOKEN ─────────────────────────────────────────
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || AUTH.REFRESH_TOKEN_EXPIRY,
  });
};

// ── GENERATE BOTH TOKENS ───────────────────────────────────────────
const generateTokenPair = (user) => {
  // CRITICAL: role comes from DB record, never from request
  const payload = {
    _id: user._id,
    email: user.email,
    role: user.role,  // Sourced from DB — cannot be tampered
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ _id: user._id });

  return { accessToken, refreshToken };
};

// ── SET TOKENS IN HTTP-ONLY COOKIES ───────────────────────────────
const setTokenCookies = (res, accessToken, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,           // JS cannot read this cookie
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,  // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: parseInt(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
  });
};

// ── CLEAR TOKEN COOKIES ────────────────────────────────────────────
const clearTokenCookies = (res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};

// ── VERIFY ACCESS TOKEN ────────────────────────────────────────────
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new ApiError(HTTP.UNAUTHORIZED, 'Invalid or expired token');
  }
};

// ── VERIFY REFRESH TOKEN ───────────────────────────────────────────
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new ApiError(HTTP.UNAUTHORIZED, 'Invalid or expired refresh token');
  }
};

// ── ROTATE REFRESH TOKEN ───────────────────────────────────────────
const rotateRefreshToken = async (oldRefreshToken) => {
  const decoded = verifyRefreshToken(oldRefreshToken);

  // Validate token matches what is stored in DB
  const user = await User.findById(decoded._id).select('+refreshToken');
  if (!user || user.refreshToken !== oldRefreshToken) {
    throw new ApiError(HTTP.UNAUTHORIZED, 'Refresh token reuse detected');
  }

  const { accessToken, refreshToken } = generateTokenPair(user);

  // Store new refresh token in DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken, user };
};

// ── GENERATE SECURE RANDOM TOKEN (for password reset) ─────────────
const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  setTokenCookies,
  clearTokenCookies,
  verifyAccessToken,
  verifyRefreshToken,
  rotateRefreshToken,
  generateSecureToken,
};