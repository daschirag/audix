const rateLimit = require('express-rate-limit');
const { HTTP } = require('../config/constants');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: HTTP.TOO_MANY_REQUESTS,
    message: 'Too many requests, please try again later.',
  },
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: HTTP.TOO_MANY_REQUESTS,
    message: 'Too many login attempts, please try again later.',
  },
});

const otpRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: HTTP.TOO_MANY_REQUESTS,
    message: 'Too many OTP requests. Please wait 5 minutes.',
  },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: HTTP.TOO_MANY_REQUESTS,
    message: 'Upload limit reached, please try again later.',
  },
});

module.exports = { apiLimiter, authRateLimiter, otpRateLimiter, uploadLimiter };
