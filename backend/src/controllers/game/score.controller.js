const Session = require('../../models/Session');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { calculateTotalScore, getStarRating } = require('../../services/game/scoreService');
const { SCORING, ROUNDS, HTTP } = require('../../config/constants');

const getMyScore = asyncHandler(async (req, res) => {
  const latestSession = await Session.findOne({
    userId: req.user._id,
    status: 'completed',
  }).sort({ totalScore: -1 });

  if (!latestSession) {
    return res.status(HTTP.OK).json(
      new ApiResponse(HTTP.OK, {
        totalScore: 0,
        gamesPlayed: 0,
        highestScore: 0,
        starRating: null,
        rounds: [],
      }, 'No completed sessions.')
    );
  }

  const percentage = Math.round((latestSession.totalScore / SCORING.TOTAL_MAX_SCORE) * 100);
  const rating = getStarRating(percentage);

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, {
      totalScore: latestSession.totalScore,
      gamesPlayed: req.user.totalGamesPlayed || 0,
      highestScore: req.user.highestScore || 0,
      starRating: rating,
      rounds: latestSession.rounds.map((r) => ({
        roundNumber: r.roundNumber,
        roundName: r.roundName,
        score: r.score,
        passed: r.passed,
        correct: r.answers?.filter((a) => a.isCorrect).length || 0,
        total: r.answers?.length || 0,
      })),
    }, 'Score fetched.')
  );
});

const getRoundBreakdown = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.sessionId);

  if (!session) {
    return res.status(HTTP.NOT_FOUND).json({ success: false, message: 'Session not found' });
  }

  const breakdown = session.rounds.map((r) => ({
    roundNumber: r.roundNumber,
    roundName: r.roundName,
    score: r.score,
    passed: r.passed,
    timeTaken: r.answers?.reduce((sum, a) => sum + (a.timeTaken || 0), 0) || 0,
    answers: r.answers.map((a) => ({
      questionId: a.questionId,
      isCorrect: a.isCorrect,
      pointsEarned: a.pointsEarned,
      timeTaken: a.timeTaken,
    })),
  }));

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, { breakdown, totalScore: session.totalScore }, 'Round breakdown fetched.')
  );
});

module.exports = { getMyScore, getRoundBreakdown };
