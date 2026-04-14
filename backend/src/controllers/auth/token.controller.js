const User = require('../../models/User');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const {
  rotateRefreshToken,
  setTokenCookies,
  clearTokenCookies,
} = require('../../services/auth/tokenService');
const { HTTP } = require('../../config/constants');

// ── REFRESH ACCESS TOKEN ───────────────────────────────────────────
const refreshToken = asyncHandler(async (req, res) => {
  // Get refresh token from HTTP-only cookie or body
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(HTTP.UNAUTHORIZED, 'Refresh token not found.');
  }

  // Rotate — verifies, checks DB, issues new pair
  const { accessToken, refreshToken: newRefreshToken, user } =
    await rotateRefreshToken(incomingRefreshToken);

  // Set new cookies
  setTokenCookies(res, accessToken, newRefreshToken);

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, {
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }, 'Token refreshed successfully.')
  );
});

// ── LOGOUT ─────────────────────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  // Invalidate refresh token in DB
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  // Clear HTTP-only cookies
  clearTokenCookies(res);

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, null, 'Logged out successfully.')
  );
});

// ── GET CURRENT USER ───────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  // req.user is already fetched from DB in verifyJWT middleware
  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, {
      user: req.user,
    }, 'User fetched successfully.')
  );
});

module.exports = { refreshToken, logout, getMe };