const crypto = require('crypto');
const User = require('../../models/User');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { sendPasswordResetEmail } = require('../../services/email/emailService');
const { generateSecureToken } = require('../../services/auth/tokenService');
const { verifyOTP } = require('../../services/auth/otpService');
const { HTTP } = require('../../config/constants');

// ── FORGOT PASSWORD ────────────────────────────────────────────────
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  // Always return same response — don't reveal if email exists
  if (!user) {
    return res.status(HTTP.OK).json(
      new ApiResponse(HTTP.OK, null,
        'If this email is registered, a password reset link has been sent.')
    );
  }

  // Generate secure random token
  const resetToken = generateSecureToken();

  // Hash token before storing in DB — never store plain token
  user.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save({ validateBeforeSave: false });

  // Send plain token in email link
  const sent = await sendPasswordResetEmail(email, resetToken);

  if (!sent) {
    // Rollback token if email fails
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(HTTP.INTERNAL_ERROR, 'Email could not be sent. Try again later.');
  }

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, null,
      'If this email is registered, a password reset link has been sent.')
  );
});

// ── RESET PASSWORD (via email link) ───────────────────────────────
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  // Hash the incoming token to compare with stored hash
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(HTTP.BAD_REQUEST, 'Reset token is invalid or has expired.');
  }

  // Set new password — pre-save hook will hash it
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // Reset login attempts on successful password reset
  user.loginAttempts = 0;
  user.lockUntil = undefined;

  await user.save();

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, null, 'Password reset successful. Please log in.')
  );
});

// ── RESET PASSWORD (via OTP) ───────────────────────────────────────
const resetPasswordViaOTP = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;

  // Verify OTP first
  await verifyOTP(email, otp, 'forgot-password');

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(HTTP.NOT_FOUND, 'User not found.');
  }

  user.password = password;
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, null, 'Password reset successful. Please log in.')
  );
});

// ── CHANGE PASSWORD (authenticated) ───────────────────────────────
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(HTTP.UNAUTHORIZED, 'Current password is incorrect.');
  }

  user.password = newPassword;
  await user.save();

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, null, 'Password changed successfully.')
  );
});

module.exports = {
  forgotPassword,
  resetPassword,
  resetPasswordViaOTP,
  changePassword,
};