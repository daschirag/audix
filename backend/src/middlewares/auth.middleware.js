const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { HTTP, ROLES } = require('../config/constants');

// ── VERIFY JWT ─────────────────────────────────────────────────────
const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers?.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new ApiError(HTTP.UNAUTHORIZED, 'Access token required.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(HTTP.UNAUTHORIZED, 'Access token expired.');
    }
    throw new ApiError(HTTP.UNAUTHORIZED, 'Invalid access token.');
  }

  const user = await User.findById(decoded._id)
    .select('-password -refreshToken -passwordResetToken');

  if (!user) {
    throw new ApiError(HTTP.UNAUTHORIZED, 'User not found.');
  }

  if (!user.isActive) {
    throw new ApiError(HTTP.FORBIDDEN, 'Account is deactivated.');
  }

  req.user = user;
  next();
});

// ── REQUIRE ADMIN ──────────────────────────────────────────────────
const requireAdmin = asyncHandler(async (req, res, next) => {
  if (req.user?.role !== ROLES.ADMIN) {
    throw new ApiError(HTTP.FORBIDDEN, 'Admin access required.');
  }
  next();
});

// ── REQUIRE SPECIFIC ROLES ─────────────────────────────────────────
const requireRole = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      throw new ApiError(HTTP.FORBIDDEN, 'Insufficient permissions.');
    }
    next();
  });

module.exports = { verifyJWT, requireAdmin, requireRole };