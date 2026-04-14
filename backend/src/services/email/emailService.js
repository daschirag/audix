const { getTransporter } = require('../../config/email');
const { otpEmailTemplate, passwordResetTemplate } = require('./templates');
const logger = require('../../utils/logger');
const { AUTH } = require('../../config/constants');

// ── BASE SEND FUNCTION ─────────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    logger.info(`📧 Email sent to ${to} — MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`❌ Email failed to ${to}: ${error.message}`);
    // Don't throw — email failure should not crash the request
    return false;
  }
};

// ── SEND OTP EMAIL ─────────────────────────────────────────────────
const sendOTPEmail = async (email, otp, purpose) => {
  const { subject, html } = otpEmailTemplate({
    otp,
    purpose,
    expiryMinutes: AUTH.OTP_EXPIRY_MINUTES,
  });

  return sendEmail({ to: email, subject, html });
};

// ── SEND PASSWORD RESET EMAIL ──────────────────────────────────────
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const { subject, html } = passwordResetTemplate({ resetURL });
  return sendEmail({ to: email, subject, html });
};

module.exports = { sendEmail, sendOTPEmail, sendPasswordResetEmail };