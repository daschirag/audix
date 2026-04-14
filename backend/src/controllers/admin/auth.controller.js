const User = require('../../models/User');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const {
  generateTokenPair,
  setTokenCookies,
  clearTokenCookies,
} = require('../../services/auth/tokenService');
const { HTTP, ROLES } = require('../../config/constants');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(HTTP.BAD_REQUEST, 'Email and password are required.');
  }

  const user = await User.findOne({ email: email.toLowerCase() })
    .select('+password +refreshToken');

  if (!user) {
    throw new ApiError(HTTP.UNAUTHORIZED, 'Invalid credentials.');
  }

  if (user.isLocked) {
    throw new ApiError(
      HTTP.FORBIDDEN,
      'Account locked due to too many failed attempts. Try again later.'
    );
  }

  if (user.role !== ROLES.ADMIN) {
    throw new ApiError(HTTP.FORBIDDEN, 'Admin access only.');
  }

  if (!user.isActive) {
    throw new ApiError(HTTP.FORBIDDEN, 'Account is deactivated.');
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    await user.incrementLoginAttempts();
    throw new ApiError(HTTP.UNAUTHORIZED, 'Invalid credentials.');
  }

  await user.resetLoginAttempts();

  const { accessToken, refreshToken } = generateTokenPair(user);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const safeUser = await User.findById(user._id)
    .select('-password -refreshToken -passwordResetToken');

  setTokenCookies(res, accessToken, refreshToken);

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, { user: safeUser, accessToken },
      'Login successful.')
  );
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $unset: { refreshToken: 1 },
  });

  clearTokenCookies(res);

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, null, 'Logged out successfully.')
  );
});

const refreshToken = asyncHandler(async (req, res) => {
  const { rotateRefreshToken, setTokenCookies: setCookies } = require('../../services/auth/tokenService');

  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(HTTP.UNAUTHORIZED, 'Refresh token required.');
  }

  const { accessToken, refreshToken: newRefreshToken, user } =
    await rotateRefreshToken(incomingRefreshToken);

  setCookies(res, accessToken, newRefreshToken);

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, { accessToken }, 'Token refreshed.')
  );
});

const getMe = asyncHandler(async (req, res) => {
  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, { user: req.user }, 'User fetched.')
  );
});

// ── BOOTSTRAP (create first admin) ────────────────────────────────
// Only works when zero admin accounts exist — one-time setup endpoint
const bootstrap = asyncHandler(async (req, res) => {
  const { secret, name, email, password } = req.body;

  const expectedSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
  if (!expectedSecret || secret !== expectedSecret) {
    throw new ApiError(HTTP.FORBIDDEN, 'Invalid bootstrap secret.');
  }

  const existingAdmin = await User.findOne({ role: ROLES.ADMIN });
  if (existingAdmin) {
    throw new ApiError(HTTP.CONFLICT, 'Admin account already exists. Bootstrap is disabled.');
  }

  if (!name || !email || !password) {
    throw new ApiError(HTTP.BAD_REQUEST, 'name, email, and password are required.');
  }

  const admin = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: ROLES.ADMIN,
    isEmailVerified: true,
    isActive: true,
  });

  const { accessToken, refreshToken: rt } = generateTokenPair(admin);
  admin.refreshToken = rt;
  await admin.save({ validateBeforeSave: false });

  const safeAdmin = await User.findById(admin._id)
    .select('-password -refreshToken -passwordResetToken');

  setTokenCookies(res, accessToken, rt);

  return res.status(HTTP.CREATED).json(
    new ApiResponse(HTTP.CREATED, { user: safeAdmin, accessToken },
      'Admin account created. Bootstrap is now disabled.')
  );
});

module.exports = { login, logout, refreshToken, getMe, bootstrap };
