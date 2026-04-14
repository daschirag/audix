const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../utils/asyncHandler');

const auditLogger = (resource) =>
  asyncHandler(async (req, res, next) => {
    res.on('finish', () => {
      const methodsToLog = ['POST', 'PATCH', 'PUT', 'DELETE'];
      if (!methodsToLog.includes(req.method)) return;

      try {
        AuditLog.create({
          actor: req.user?._id || null,
          action: req.method,
          resource,
          resourceId: req.params?.id || null,
          details: {
            body: sanitizeBody(req.body),
            query: req.query,
            path: req.originalUrl,
            statusCode: res.statusCode,
          },
          ip: req.ip || req.connection?.remoteAddress,
          userAgent: req.headers['user-agent'],
        });
      } catch (err) {
        // Audit log failure should never crash the request
        console.error('Audit log failed:', err.message);
      }
    });
    next();
  });

function sanitizeBody(body) {
  if (!body) return {};
  const sensitive = ['password', 'newPassword', 'currentPassword', 'confirmPassword', 'otp', 'token', 'refreshToken'];
  const sanitized = { ...body };
  for (const key of sensitive) {
    if (sanitized[key]) sanitized[key] = '[REDACTED]';
  }
  return sanitized;
}

module.exports = auditLogger;
