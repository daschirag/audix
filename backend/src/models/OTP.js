const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
      select: false, // Never exposed in queries
    },
    purpose: {
      type: String,
      enum: ['login', 'forgot-password', 'verify-email'],
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// ── AUTO DELETE expired OTPs via MongoDB TTL index ─────────────────
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ email: 1, purpose: 1 });

// ── PRE-SAVE: hash OTP before storing ─────────────────────────────
otpSchema.pre('save', async function () {
  if (!this.isModified('otp')) return;
  this.otp = await bcrypt.hash(this.otp, 10);
});

// ── METHOD: verify OTP ─────────────────────────────────────────────
otpSchema.methods.verifyOTP = async function (candidateOTP) {
  return bcrypt.compare(candidateOTP, this.otp);
};

const OTP = mongoose.model('OTP', otpSchema);
module.exports = OTP;
