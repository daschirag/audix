const Session = require('../../models/Session');
const GameSession = require('../../models/GameSession');
const User = require('../../models/User');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { createGameSession } = require('../../services/game/roundService');
const { updateLeaderboard } = require('../../services/game/leaderboardService');
const { calculateTotalScore, getStarRating } = require('../../services/game/scoreService');
const { SESSION_STATUS, ROUNDS, SCORING, HTTP } = require('../../config/constants');

// ── CREATE SESSION ─────────────────────────────────────────────────
// Handles TWO cases:
// 1. POST with empty body → Create new session
// 2. POST with roundScores → Save completed session with scoring
const createSession = asyncHandler(async (req, res) => {
  // Validate user is authenticated
  if (!req.user || !req.user._id) {
    throw new ApiError(HTTP.UNAUTHORIZED, 'User must be authenticated to create a session');
  }

  const { roundScores, totalScore, piiLeaked, durationSeconds } = req.body || {};

  // Case 1: Session submission with scores
  if (roundScores && totalScore !== undefined) {
    // Validate roundScores
    if (!Array.isArray(roundScores) || roundScores.length !== 6) {
      throw new ApiError(HTTP.BAD_REQUEST, 'Expected 6 roundScores.');
    }

    // Build rounds array and validate scores against max
    const rounds = roundScores.map((rs) => {
      const roundNum = rs.roundNumber;
      const maxScore = roundNum === 3 ? SCORING.ROUND3_MAX_SCORE : SCORING.MAX_SCORE_PER_ROUND;
      
      // Clamp score to max if it exceeds
      const clampedScore = Math.min(rs.score || 0, maxScore);
      
      return {
        roundNumber: roundNum,
        roundName: ROUNDS.NAMES[roundNum - 1],
        score: clampedScore,
        passed: clampedScore >= (maxScore * 0.6), // 60% pass threshold
        answers: [], // Not provided in submission
      };
    });

    // Calculate final score (may differ from submitted if we clamped)
    const calculatedTotal = rounds.reduce((sum, r) => sum + r.score, 0);

    // Create completed session
    const session = await Session.create({
      userId: req.user._id,
      status: SESSION_STATUS.COMPLETED,
      currentRound: 6,
      totalScore: calculatedTotal,
      rounds,
      completedAt: new Date(),
      metadata: {
        piiLeaked: piiLeaked || {},
        durationSeconds: durationSeconds || 0,
      },
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalGamesPlayed: 1 },
      $set: { lastPlayedAt: new Date() },
      $max: { bestScore: calculatedTotal },
    });

    // Update leaderboard
    await updateLeaderboard(req.user._id);

    // Calculate rank
    const percentage = Math.round((calculatedTotal / SCORING.TOTAL_MAX_SCORE) * 100);
    const rating = getStarRating(percentage);

    return res.status(HTTP.CREATED).json(
      new ApiResponse(HTTP.CREATED, {
        sessionId: session._id,
        totalScore: calculatedTotal,
        maxPossibleScore: SCORING.TOTAL_MAX_SCORE,
        percentage,
        rank: rating.title,
        stars: rating.stars,
        rounds,
      }, 'Session saved successfully.')
    );
  }

  // Case 2: Create new empty session
  const existingActive = await Session.findOne({
    userId: req.user._id,
    status: { $in: [SESSION_STATUS.PENDING, SESSION_STATUS.ACTIVE] },
  });

  if (existingActive) {
    return res.status(HTTP.OK).json(
      new ApiResponse(HTTP.OK, {
        sessionId: existingActive._id,
        currentRound: existingActive.currentRound,
        status: existingActive.status,
        totalScore: existingActive.totalScore,
        completedRounds: existingActive.rounds.map((r) => r.roundNumber),
      }, 'Active session already exists.')
    );
  }

  const session = await Session.create({
    userId: req.user._id,
    status: SESSION_STATUS.PENDING,
    currentRound: 1,
    totalScore: 0,
    rounds: [],
  });

  // FIX: correct arg order — createGameSession(userId, sessionId)
  const gameSession = await createGameSession(req.user._id, session._id);

  return res.status(HTTP.CREATED).json(
    new ApiResponse(HTTP.CREATED, {
      sessionId: session._id,
      currentRound: session.currentRound,
      status: session.status,
      totalScore: 0,
      completedRounds: [],
      gameSessionId: gameSession._id,
    }, 'Session created successfully.')
  );
});

// ── GET ACTIVE SESSION ─────────────────────────────────────────────
const getActiveSession = asyncHandler(async (req, res) => {
  const session = await Session.findOne({
    userId: req.user._id,
    status: { $in: [SESSION_STATUS.PENDING, SESSION_STATUS.ACTIVE] },
  }).sort({ createdAt: -1 });

  if (!session) {
    return res.status(HTTP.OK).json(
      new ApiResponse(HTTP.OK, null, 'No active session.')
    );
  }

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, {
      sessionId: session._id,
      currentRound: session.currentRound,
      status: session.status,
      totalScore: session.totalScore,
      completedRounds: session.rounds.map((r) => r.roundNumber),
      roundsCompleted: session.rounds.map((r) => r.roundNumber), // alias
    }, 'Active session fetched.')
  );
});

// ── END SESSION ────────────────────────────────────────────────────
const endSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);

  if (!session) throw new ApiError(HTTP.NOT_FOUND, 'Session not found.');
  if (session.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(HTTP.FORBIDDEN, 'Not your session.');
  }

  session.status = SESSION_STATUS.COMPLETED;
  session.completedAt = new Date();
  session.totalScore = session.rounds.reduce((sum, r) => sum + (r.score || 0), 0);
  await session.save();

  // Update user stats
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { totalGamesPlayed: 1 },
    $set: { lastPlayedAt: new Date() },
    $max: { highestScore: session.totalScore },
  });

  // Update leaderboard
  await updateLeaderboard(req.user._id);

  // FIX: SCORING now imported at top
  const percentage = Math.round((session.totalScore / SCORING.TOTAL_MAX_SCORE) * 100);
  const rating = getStarRating(percentage);

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, { session, rating }, 'Session completed.')
  );
});

// ── GET SESSION HISTORY ────────────────────────────────────────────
const getSessionHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [sessions, total] = await Promise.all([
    Session.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Session.countDocuments({ userId: req.user._id }),
  ]);

  // FIX: return sessions array directly at data level for frontend compatibility
  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, sessions, 'Session history fetched.')
  );
});

// ── GET SESSION DETAIL ─────────────────────────────────────────────
const getSessionDetail = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);

  if (!session) throw new ApiError(HTTP.NOT_FOUND, 'Session not found.');
  if (session.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(HTTP.FORBIDDEN, 'Not your session.');
  }

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, { session }, 'Session detail fetched.')
  );
});

module.exports = {
  createSession, getActiveSession, endSession,
  getSessionHistory, getSessionDetail,
};
