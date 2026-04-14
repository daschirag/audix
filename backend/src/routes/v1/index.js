const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../../middlewares/auth.middleware');
const { getLeaderboard } = require('../../controllers/user/leaderboard.controller');
const User = require('../../models/User');
const { runSeed, ADMIN } = require('../../jobs/seed');

router.use('/auth', require('./auth.routes'));
router.use('/game', require('./game.routes'));
router.use('/user', require('./user.routes'));

// Global leaderboard endpoint (authenticated)
router.get('/leaderboard', verifyJWT, getLeaderboard);

// ── ONE-TIME PRODUCTION SEED ───────────────────────────────────────
// Usage: POST /api/v1/seed-production
//        Header: x-seed-secret: <ADMIN_BOOTSTRAP_SECRET>
// Only works in production; self-disables once admin exists.
router.post('/seed-production', async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      return res.status(403).json({ success: false, message: 'Only available in production' });
    }

    const secret = req.headers['x-seed-secret'];
    if (!secret || secret !== process.env.ADMIN_BOOTSTRAP_SECRET) {
      return res.status(401).json({ success: false, message: 'Invalid or missing seed secret' });
    }

    const adminExists = await User.findOne({ email: ADMIN.email });
    if (adminExists) {
      return res.status(200).json({ success: false, message: 'Already seeded — admin already exists' });
    }

    const result = await runSeed();
    return res.status(200).json({ success: true, message: 'Seeded successfully', ...result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/', (_req, res) => {
  res.json({ message: 'Audix API v1 is live' });
});

module.exports = router;
