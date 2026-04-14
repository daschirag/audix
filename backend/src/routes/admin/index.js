const express = require('express');
const router = express.Router();

const authRoutes       = require('./auth.routes');
const questionRoutes   = require('./questions.routes');
const uploadRoutes     = require('./upload.routes');
const userRoutes       = require('./users.routes');
const sessionRoutes    = require('./sessions.routes');
const analyticsRoutes  = require('./analytics.routes');

router.use('/auth',      authRoutes);
router.use('/questions', questionRoutes);
router.use('/upload',    uploadRoutes);
router.use('/users',     userRoutes);
router.use('/sessions',  sessionRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
