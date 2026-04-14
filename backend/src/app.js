const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');

const v1Routes = require('./routes/v1/index');
const adminRoutes = require('./routes/admin/index');
const { errorHandler, notFound } = require('./middlewares/errorHandler.middleware');
const { apiLimiter } = require('./middlewares/rateLimit.middleware');
const logger = require('./utils/logger');
const { API } = require('./config/constants');

const app = express();

// ── SECURITY ───────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── RATE LIMITING ──────────────────────────────────────────────────
app.use(`/api/${API.VERSION}`, apiLimiter);

// ── PARSERS ────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── LOGGING ────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }));
}

// ── STATIC FILES ───────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── HEALTH CHECK ───────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── API ROUTES ─────────────────────────────────────────────────────
app.use(`/api/${API.VERSION}`, v1Routes);
app.use(`/api/${API.VERSION}/admin`, adminRoutes);

// ── ERROR HANDLING ─────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
