const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const leaderboardService = require('../../services/game/leaderboardService');
const { HTTP } = require('../../config/constants');

// ── GET LEADERBOARD ────────────────────────────────────────────────
// FIX: return flat array with name/department/score fields so frontend
//      can do Array.isArray(r.data.data) → true
const getLeaderboard = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const raw = await leaderboardService.getLeaderboard(limit);

  // Flatten populated userId data into top-level fields
  const entries = raw.map((entry) => {
    const u = entry.userId || {};
    return {
      _id:        entry._id,
      userId:     u._id || entry.userId,
      name:       u.name       || 'Anonymous',
      email:      u.email      || '',
      department: u.department || null,
      score:      entry.totalScore || 0,
      highestScore: entry.totalScore || 0,
      rank:       entry.rank    || 0,
      badges:     entry.badges?.length || 0,
      roundsCompleted: entry.roundsCompleted || 0,
      lastUpdated: entry.lastUpdated,
    };
  });

  // data is the array directly — frontend: r.data.data → array
  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, entries, 'Leaderboard fetched.')
  );
});

// ── GET MY RANK ────────────────────────────────────────────────────
// FIX: return flat object with rank + score fields
const getMyRank = asyncHandler(async (req, res) => {
  const entry = await leaderboardService.getUserRank(req.user._id);

  if (!entry) {
    return res.status(HTTP.OK).json(
      new ApiResponse(HTTP.OK, null, 'Not on the leaderboard yet.')
    );
  }

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, {
      rank:     entry.rank    || 0,
      position: entry.rank    || 0,
      score:    entry.totalScore || 0,
      highestScore: entry.totalScore || 0,
      badges:   entry.badges?.length || 0,
      roundsCompleted: entry.roundsCompleted || 0,
    }, 'Your rank fetched.')
  );
});

module.exports = { getLeaderboard, getMyRank };
