const Joi = require('joi');

// ── REUSABLE FIELDS ────────────────────────────────────────────────
const emailField = Joi.string().email().lowercase().trim().required()
  .messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  });

const passwordField = Joi.string().min(8).max(64).required()
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  .messages({
    'string.min': 'Password must be at least 8 characters',
    'string.pattern.base':
      'Password must contain uppercase, lowercase, number and special character',
    'any.required': 'Password is required',
  });

// ── SCHEMAS ────────────────────────────────────────────────────────
const signupSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'any.required': 'Name is required',
    }),
  email: emailField,
  password: passwordField,
  department: Joi.string().max(50).trim().optional(),
});

const loginSchema = Joi.object({
  email: emailField,
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

const otpRequestSchema = Joi.object({
  email: emailField,
  purpose: Joi.string()
    .valid('login', 'forgot-password', 'verify-email')
    .required()
    .messages({
      'any.only': 'Invalid OTP purpose',
      'any.required': 'Purpose is required',
    }),
});

const otpVerifySchema = Joi.object({
  email: emailField,
  otp: Joi.string().length(6).pattern(/^\d+$/).required()
    .messages({
      'string.length': 'OTP must be exactly 6 digits',
      'string.pattern.base': 'OTP must contain only numbers',
      'any.required': 'OTP is required',
    }),
  purpose: Joi.string()
    .valid('login', 'forgot-password', 'verify-email')
    .required(),
});

const forgotPasswordSchema = Joi.object({
  email: emailField,
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required',
  }),
  password: passwordField,
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Confirm password is required',
    }),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
  }),
  newPassword: passwordField,
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    .messages({
      'any.only': 'Passwords do not match',
    }),
});

// ── VALIDATE MIDDLEWARE FACTORY ────────────────────────────────────
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,    // Return all errors at once
    stripUnknown: true,   // Remove unknown fields — prevents injection
  });

  if (error) {
    const errors = error.details.map((d) => d.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  req.body = value; // Use sanitized value
  next();
};

module.exports = {
  validate,
  signupSchema,
  loginSchema,
  otpRequestSchema,
  otpVerifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
};