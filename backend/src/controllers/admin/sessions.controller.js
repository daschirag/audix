const Session = require('../../models/Session');
const User = require('../../models/User');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { HTTP, SESSION_STATUS } = require('../../config/constants');

// ── GET ALL SESSIONS ───────────────────────────────────────────────
const getSessions = asyncHandler(async (req, res) => {
  const {
    status,
    round,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    order = 'desc',
  } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (round)  filter.currentRound = parseInt(round);

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;

  const [sessions, total] = await Promise.all([
    Session.find(filter)
      .populate('userId', 'name email department')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit)),
    Session.countDocuments(filter),
  ]);

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, {
      sessions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    }, 'Sessions fetched successfully.')
  );
});

// ── GET SINGLE SESSION ─────────────────────────────────────────────
const getSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id)
    .populate('userId', 'name email department')
    .populate('rounds.answers.questionId');

  if (!session) {
    throw new ApiError(HTTP.NOT_FOUND, 'Session not found.');
  }

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, { session }, 'Session fetched.')
  );
});

// ── GET SESSIONS BY USER ───────────────────────────────────────────
const getSessionsByUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    throw new ApiError(HTTP.NOT_FOUND, 'User not found.');
  }

  const sessions = await Session.find({ userId: req.params.userId })
    .sort({ createdAt: -1 });

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, { sessions }, 'User sessions fetched.')
  );
});

// ── TERMINATE SESSION ──────────────────────────────────────────────
const terminateSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);
  if (!session) {
    throw new ApiError(HTTP.NOT_FOUND, 'Session not found.');
  }

  if (session.status === SESSION_STATUS.COMPLETED ||
      session.status === SESSION_STATUS.TERMINATED) {
    throw new ApiError(HTTP.BAD_REQUEST,
      `Session is already ${session.status}.`);
  }

  session.status = SESSION_STATUS.TERMINATED;
  session.terminatedAt = new Date();
  session.terminatedBy = req.user._id;
  await session.save();

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, { session }, 'Session terminated.')
  );
});

// ── GET SESSION STATS ──────────────────────────────────────────────
const getSessionStats = asyncHandler(async (req, res) => {
  const stats = await Session.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgScore: { $avg: '$totalScore' },
      },
    },
  ]);

  const roundStats = await Session.aggregate([
    {
      $group: {
        _id: '$currentRound',
        count: { $sum: 1 },
        avgScore: { $avg: '$totalScore' },
        passed: {
          $sum: {
            $cond: [{ $eq: ['$status', SESSION_STATUS.COMPLETED] }, 1, 0],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayCount = await Session.countDocuments({
    createdAt: { $gte: today },
  });

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, {
      byStatus: stats,
      byRound: roundStats,
      today: todayCount,
    }, 'Session stats fetched.')
  );
});

// ── RESET SESSION (allow retry) ────────────────────────────────────
const resetSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);
  if (!session) {
    throw new ApiError(HTTP.NOT_FOUND, 'Session not found.');
  }

  session.status = SESSION_STATUS.PENDING;
  session.currentRound = 1;
  session.totalScore = 0;
  session.rounds = [];
  session.startedAt = null;
  session.completedAt = null;
  session.terminatedAt = null;

  await session.save();

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, { session }, 'Session reset successfully.')
  );
});

module.exports = {
  getSessions,
  getSession,
  getSessionsByUser,
  terminateSession,
  getSessionStats,
  resetSession,
};