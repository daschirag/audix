const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter = null;

const createTransporter = () => {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  return transporter;
};

const verifyEmailConnection = async () => {
  try {
    const t = transporter || createTransporter();
    await t.verify();
    logger.info('✅ Email (SMTP) connection verified');
  } catch (error) {
    logger.warn(`⚠️  Email connection failed: ${error.message}`);
    logger.warn('📧 OTP email sending will not work until SMTP is configured');
  }
};

const getTransporter = () => {
  if (!transporter) createTransporter();
  return transporter;
};

module.exports = { createTransporter, verifyEmailConnection, getTransporter };