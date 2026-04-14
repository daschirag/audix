const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { HTTP } = require('../config/constants');

// ── GLOBAL ERROR HANDLER ───────────────────────────────────────────
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Wrap non-ApiError instances
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || HTTP.INTERNAL_SERVER_ERROR;
    const message = error.message || 'Something went wrong.';
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    error = new ApiError(HTTP.BAD_REQUEST, `Invalid ${err.path}: ${err.value}`);
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ApiError(
      HTTP.CONFLICT,
      `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`
    );
  }

  // Handle Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(HTTP.BAD_REQUEST, messages.join(', '));
  }

  // Log server errors
  if (error.statusCode >= 500) {
    logger.error(`[${req.method}] ${req.path} → ${error.message}`, {
      stack: error.stack,
      body: req.body,
    });
  }

  return res.status(error.statusCode || HTTP.INTERNAL_SERVER_ERROR).json({
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

// ── 404 HANDLER ────────────────────────────────────────────────────
const notFound = (req, res, next) => {
  next(new ApiError(HTTP.NOT_FOUND, `Route ${req.originalUrl} not found.`));
};

module.exports = { errorHandler, notFound };