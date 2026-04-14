const express = require('express');
const router = express.Router();
const { verifyJWT, requireAdmin } = require('../../middlewares/auth.middleware');
const { getAnalytics, getScoreDistribution, getRoundStats, getOverview } = require('../../controllers/admin/analytics.controller');

router.use(verifyJWT, requireAdmin);

router.get('/overview',          getOverview);
router.get('/',                 getAnalytics);
router.get('/score-distribution', getScoreDistribution);
router.get('/round-stats',      getRoundStats);

module.exports = router;
