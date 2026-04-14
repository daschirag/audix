const User = require('../../models/User');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { generateTokenPair, setTokenCookies } = require('../../services/auth/tokenService');
const { createOTP } = require('../../services/auth/otpService');
const { sendOTPEmail } = require('../../services/email/emailService');
const { HTTP, ROLES } = require('../../config/constants');

const signup = asyncHandler(async (req, res) => {
  const { name, email, password, department } = req.body;

  // ── CHECK DUPLICATE EMAIL ────────────────────────────────────────
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(HTTP.CONFLICT, 'An account with this email already exists.');
  }

  // ── FORCE ROLE TO USER ───────────────────────────────────────────
  // CRITICAL: role is NEVER taken from request body
  // Admin accounts can only be created via seeder or direct DB
  const user = await User.create({
    name,
    email,
    password,
    department,
    role: ROLES.USER, // Hardcoded — cannot be overridden
  });

  // ── SEND EMAIL VERIFICATION OTP ──────────────────────────────────
  const { otpCode } = await createOTP(email, 'verify-email');
  await sendOTPEmail(email, otpCode, 'verify-email');

  // ── GENERATE TOKENS ──────────────────────────────────────────────
  const { accessToken, refreshToken } = generateTokenPair(user);

  // Store refresh token in DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Set HTTP-only cookies
  setTokenCookies(res, accessToken, refreshToken);

  return res.status(HTTP.CREATED).json(
    new ApiResponse(HTTP.CREATED, {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken,
    }, 'Account created successfully. Please verify your email.')
  );
});

module.exports = { signup };