const User = require('../../models/User');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { createOTP, verifyOTP } = require('../../services/auth/otpService');
const { sendOTPEmail } = require('../../services/email/emailService');
const { generateTokenPair, setTokenCookies } = require('../../services/auth/tokenService');
const { HTTP } = require('../../config/constants');

// ── REQUEST OTP ────────────────────────────────────────────────────
const requestOTP = asyncHandler(async (req, res) => {
  const { email, purpose } = req.body;

  // For login via OTP — user must already exist
  if (purpose === 'login') {
    const user = await User.findOne({ email });
    if (!user) {
      // Generic message — don't reveal if email exists
      return res.status(HTTP.OK).json(
        new ApiResponse(HTTP.OK, null,
          'If this email is registered, an OTP has been sent.')
      );
    }

    if (!user.isActive) {
      throw new ApiError(HTTP.UNAUTHORIZED, 'Account deactivated. Contact support.');
    }
  }

  // Generate and send OTP
  const { otpCode } = await createOTP(email, purpose);
  await sendOTPEmail(email, otpCode, purpose);

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, null,
      'If this email is registered, an OTP has been sent.')
  );
});

// ── VERIFY OTP + LOGIN ─────────────────────────────────────────────
const verifyOTPAndLogin = asyncHandler(async (req, res) => {
  const { email, otp, purpose } = req.body;

  // Verify the OTP (throws on failure)
  await verifyOTP(email, otp, purpose);

  if (purpose === 'login') {
    const user = await User.findOne({ email }).select('+refreshToken');
    if (!user) {
      throw new ApiError(HTTP.UNAUTHORIZED, 'User not found.');
    }

    if (!user.isActive) {
      throw new ApiError(HTTP.UNAUTHORIZED, 'Account deactivated.');
    }

    // Mark email as verified if not already
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

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
      }, 'OTP login successful.')
    );
  }

  if (purpose === 'verify-email') {
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(HTTP.NOT_FOUND, 'User not found.');

    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });

    return res.status(HTTP.OK).json(
      new ApiResponse(HTTP.OK, null, 'Email verified successfully.')
    );
  }

  // For forgot-password — just confirm OTP was valid
  // Actual reset happens in password.controller.js
  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, { verified: true }, 'OTP verified successfully.')
  );
});

module.exports = { requestOTP, verifyOTPAndLogin };