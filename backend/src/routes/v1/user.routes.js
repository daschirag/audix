const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../../middlewares/auth.middleware');

const { getProfile, updateProfile, getMyStats } = require('../../controllers/user/profile.controller');
const { getLeaderboard, getMyRank } = require('../../controllers/user/leaderboard.controller');
const { getPIIReport, getLatestPIIReport } = require('../../controllers/user/pii.controller');

router.use(verifyJWT);

// Profile
router.get('/me',            getProfile);           // Alias for /profile
router.get('/profile',       getProfile);
router.patch('/profile',     updateProfile);
router.get('/stats',         getMyStats);

// Leaderboard
router.get('/leaderboard',   getLeaderboard);
router.get('/leaderboard/me', getMyRank);

// PII Report
router.get('/pii-report',           getLatestPIIReport);
router.get('/pii-report/:sessionId', getPIIReport);

module.exports = router;
