const express = require('express');
const router = express.Router();

const { signup }                = require('../../controllers/auth/signup.controller');
const { login }                 = require('../../controllers/auth/login.controller');
const { requestOTP,
        verifyOTPAndLogin }     = require('../../controllers/auth/otp.controller');
const { forgotPassword,
        resetPassword,
        resetPasswordViaOTP,
        changePassword }        = require('../../controllers/auth/password.controller');
const { refreshToken,
        logout,
        getMe }                 = require('../../controllers/auth/token.controller');

const { validate,
        signupSchema,
        loginSchema,
        otpRequestSchema,
        otpVerifySchema,
        forgotPasswordSchema,
        resetPasswordSchema,
        changePasswordSchema }  = require('../../validators/auth.validator');

const { authRateLimiter,
        otpRateLimiter }        = require('../../middlewares/rateLimit.middleware');
const { verifyJWT }             = require('../../middlewares/auth.middleware');

// ── PUBLIC ROUTES ──────────────────────────────────────────────────
router.post('/signup',
  authRateLimiter,
  validate(signupSchema),
  signup
);

// Alias: /register → /signup (frontend may use either)
router.post('/register',
  authRateLimiter,
  validate(signupSchema),
  signup
);

router.post('/login',
  authRateLimiter,
  validate(loginSchema),
  login
);

router.post('/otp/request',
  otpRateLimiter,
  validate(otpRequestSchema),
  requestOTP
);

router.post('/otp/verify',
  authRateLimiter,
  validate(otpVerifySchema),
  verifyOTPAndLogin
);

router.post('/forgot-password',
  authRateLimiter,
  validate(forgotPasswordSchema),
  forgotPassword
);

router.post('/reset-password',
  authRateLimiter,
  validate(resetPasswordSchema),
  resetPassword
);

router.post('/reset-password/otp',
  authRateLimiter,
  resetPasswordViaOTP
);

router.post('/refresh-token',
  refreshToken
);

// ── PROTECTED ROUTES (require valid JWT) ──────────────────────────
router.post('/logout',
  verifyJWT,
  logout
);

router.get('/me',
  verifyJWT,
  getMe
);

router.post('/change-password',
  verifyJWT,
  validate(changePasswordSchema),
  changePassword
);

module.exports = router;
