const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../../middlewares/auth.middleware');
const { getLeaderboard } = require('../../controllers/user/leaderboard.controller');

router.use('/auth', require('./auth.routes'));
router.use('/game', require('./game.routes'));
router.use('/user', require('./user.routes'));

// Global leaderboard endpoint (authenticated)
router.get('/leaderboard', verifyJWT, getLeaderboard);

router.get('/', (req, res) => {
  res.json({ message: 'Audix API v1 is live' });
});

module.exports = router;
