const User = require('../../models/User');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { generateTokenPair, setTokenCookies } = require('../../services/auth/tokenService');
const { HTTP } = require('../../config/constants');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // ── FETCH USER WITH PASSWORD ─────────────────────────────────────
  const user = await User.findOne({ email }).select('+password +refreshToken');

  if (!user) {
    throw new ApiError(HTTP.UNAUTHORIZED, 'Invalid email or password.');
  }

  // ── CHECK ACCOUNT STATUS ─────────────────────────────────────────
  if (!user.isActive) {
    throw new ApiError(HTTP.UNAUTHORIZED, 'Your account has been deactivated. Contact support.');
  }

  // ── CHECK ACCOUNT LOCKOUT ─────────────────────────────────────────
  if (user.isLocked) {
    const unlockTime = new Date(user.lockUntil).toLocaleTimeString();
    throw new ApiError(
      HTTP.TOO_MANY_REQUESTS,
      `Account locked due to too many failed attempts. Try again after ${unlockTime}.`
    );
  }

  // ── VERIFY PASSWORD ───────────────────────────────────────────────
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    // Increment failed attempts — may trigger lockout
    await user.incrementLoginAttempts();
    throw new ApiError(HTTP.UNAUTHORIZED, 'Invalid email or password.');
  }

  // ── RESET ATTEMPTS ON SUCCESS ─────────────────────────────────────
  await user.resetLoginAttempts();

  // ── GENERATE TOKENS ───────────────────────────────────────────────
  const { accessToken, refreshToken } = generateTokenPair(user);

  // Store refresh token in DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Set HTTP-only cookies
  setTokenCookies(res, accessToken, refreshToken);

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        department: user.department,
      },
      accessToken,
    }, 'Login successful.')
  );
});

module.exports = { login };