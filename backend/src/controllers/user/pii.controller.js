const Session = require('../../models/Session');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { HTTP, ROUNDS } = require('../../config/constants');

const getPIIReport = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await Session.findById(sessionId);
  if (!session) throw new ApiError(HTTP.NOT_FOUND, 'Session not found.');
  if (session.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(HTTP.FORBIDDEN, 'Not your session.');
  }

  // Collect PII-related answers from round 3 (PII Identification)
  const piiRound = session.rounds.find((r) => r.roundNumber === 3);

  const piiFindings = [];
  const piiMissed = [];

  if (piiRound?.answers) {
    piiRound.answers.forEach((answer) => {
      if (answer.isCorrect) {
        piiFindings.push({
          questionId: answer.questionId,
          pointsEarned: answer.pointsEarned,
          timeTaken: answer.timeTaken,
        });
      } else {
        piiMissed.push({
          questionId: answer.questionId,
          timeTaken: answer.timeTaken,
        });
      }
    });
  }

  // Overall PII awareness score across all rounds
  let totalPIIPoints = 0;
  let totalPIIPossible = 0;

  session.rounds.forEach((round) => {
    round.answers?.forEach((answer) => {
      if (answer.pointsEarned > 0) totalPIIPoints += answer.pointsEarned;
      totalPIIPossible += 100; // base score per question
    });
  });

  const awarenessPercentage = totalPIIPossible > 0
    ? Math.round((totalPIIPoints / totalPIIPossible) * 100)
    : 0;

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, {
      sessionId: session._id,
      totalScore: session.totalScore,
      piiRound: {
        roundNumber: 3,
        roundName: ROUNDS.NAMES[2],
        score: piiRound?.score || 0,
        passed: piiRound?.passed || false,
        findings: piiFindings.length,
        missed: piiMissed.length,
        details: piiFindings,
        missedDetails: piiMissed,
      },
      overallAwareness: {
        percentage: awarenessPercentage,
        rating: awarenessPercentage >= 80 ? 'Excellent' : awarenessPercentage >= 60 ? 'Good' : awarenessPercentage >= 40 ? 'Needs Improvement' : 'Poor',
      },
      roundsSummary: session.rounds.map((r) => ({
        roundNumber: r.roundNumber,
        roundName: r.roundName,
        score: r.score,
        passed: r.passed,
      })),
    }, 'PII report generated.')
  );
});

const getLatestPIIReport = asyncHandler(async (req, res) => {
  const latestSession = await Session.findOne({
    userId: req.user._id,
    status: 'completed',
  }).sort({ completedAt: -1 });

  if (!latestSession) {
    return res.status(HTTP.OK).json(
      new ApiResponse(HTTP.OK, { report: null }, 'No completed sessions found.')
    );
  }

  const piiRound = latestSession.rounds.find((r) => r.roundNumber === 3);
  const piiFindings = [];
  const piiMissed = [];

  if (piiRound?.answers) {
    piiRound.answers.forEach((answer) => {
      if (answer.isCorrect) {
        piiFindings.push({ questionId: answer.questionId, pointsEarned: answer.pointsEarned });
      } else {
        piiMissed.push({ questionId: answer.questionId });
      }
    });
  }

  let totalPIIPoints = 0;
  let totalPIIPossible = 0;
  latestSession.rounds.forEach((round) => {
    round.answers?.forEach((answer) => {
      if (answer.pointsEarned > 0) totalPIIPoints += answer.pointsEarned;
      totalPIIPossible += 100;
    });
  });

  const awarenessPercentage = totalPIIPossible > 0
    ? Math.round((totalPIIPoints / totalPIIPossible) * 100) : 0;

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, {
      sessionId: latestSession._id,
      totalScore: latestSession.totalScore,
      piiRound: {
        roundNumber: 3,
        roundName: ROUNDS.NAMES[2],
        score: piiRound?.score || 0,
        passed: piiRound?.passed || false,
        findings: piiFindings.length,
        missed: piiMissed.length,
      },
      overallAwareness: {
        percentage: awarenessPercentage,
        rating: awarenessPercentage >= 80 ? 'Excellent' : awarenessPercentage >= 60 ? 'Good' : awarenessPercentage >= 40 ? 'Needs Improvement' : 'Poor',
      },
      roundsSummary: latestSession.rounds.map((r) => ({
        roundNumber: r.roundNumber,
        roundName: r.roundName,
        score: r.score,
        passed: r.passed,
      })),
    }, 'Latest PII report fetched.')
  );
});

module.exports = { getPIIReport, getLatestPIIReport };
