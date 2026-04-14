const crypto = require('crypto');
const OTP = require('../../models/OTP');
const ApiError = require('../../utils/ApiError');
const { AUTH, HTTP } = require('../../config/constants');

// ── GENERATE 6-DIGIT OTP ───────────────────────────────────────────
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// ── CREATE & STORE OTP ─────────────────────────────────────────────
const createOTP = async (email, purpose) => {
  // Invalidate any existing unused OTPs for this email+purpose
  await OTP.deleteMany({ email, purpose, isUsed: false });

  const otpCode = generateOTP();
  const expiresAt = new Date(
    Date.now() + AUTH.OTP_EXPIRY_MINUTES * 60 * 1000
  );

  // Save — pre-save hook will hash the OTP
  const otpRecord = await OTP.create({
    email,
    purpose,
    otp: otpCode,
    expiresAt,
  });

  // Return plain OTP only here — never stored in plain text
  return { otpCode, otpRecord };
};

// ── VERIFY OTP ─────────────────────────────────────────────────────
const verifyOTP = async (email, candidateOTP, purpose) => {
  // Fetch with otp field (select: false by default)
  const otpRecord = await OTP.findOne({
    email,
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  }).select('+otp');

  if (!otpRecord) {
    throw new ApiError(HTTP.BAD_REQUEST, 'OTP expired or not found. Please request a new one.');
  }

  // Increment attempt count
  otpRecord.attempts += 1;
  await otpRecord.save({ validateBeforeSave: false });

  // Block after max attempts
  if (otpRecord.attempts > AUTH.OTP_MAX_ATTEMPTS) {
    await OTP.deleteOne({ _id: otpRecord._id });
    throw new ApiError(HTTP.TOO_MANY_REQUESTS, 'Too many incorrect OTP attempts. Please request a new one.');
  }

  // Compare hashed OTP
  const isValid = await otpRecord.verifyOTP(candidateOTP);
  if (!isValid) {
    const remaining = AUTH.OTP_MAX_ATTEMPTS - otpRecord.attempts;
    throw new ApiError(HTTP.BAD_REQUEST, `Incorrect OTP. ${remaining} attempt(s) remaining.`);
  }

  // Mark as used
  otpRecord.isUsed = true;
  await otpRecord.save({ validateBeforeSave: false });

  return true;
};

// ── CLEANUP EXPIRED OTPs (manual — MongoDB TTL handles this auto) ──
const cleanupExpiredOTPs = async () => {
  const result = await OTP.deleteMany({ expiresAt: { $lt: new Date() } });
  return result.deletedCount;
};

module.exports = { generateOTP, createOTP, verifyOTP, cleanupExpiredOTPs };