const Session = require('../../models/Session');
const User = require('../../models/User');
const Question = require('../../models/Question');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { HTTP, ROUNDS } = require('../../config/constants');
const dayjs = require('dayjs');

const getAnalytics = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const since = dayjs().subtract(days, 'day').startOf('day').toDate();

  const daily = await Session.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        avgScore: { $avg: '$totalScore' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const byDept = await Session.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: { $ifNull: ['$user.department', 'Unknown'] },
        count: { $sum: 1 },
        avgScore: { $avg: '$totalScore' },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, { daily, byDept }, 'Analytics fetched.')
  );
});

const getScoreDistribution = asyncHandler(async (req, res) => {
  const ranges = [
    { range: '0-500', min: 0, max: 500 },
    { range: '500-1000', min: 500, max: 1000 },
    { range: '1000-1500', min: 1000, max: 1500 },
    { range: '1500-2000', min: 1500, max: 2000 },
    { range: '2000-2500', min: 2000, max: 2500 },
    { range: '2500-3000', min: 2500, max: 3000 },
    { range: '3000+', min: 3000, max: Infinity },
  ];

  const completed = await Session.find({ status: 'completed' }).select('totalScore');
  const counts = {};
  ranges.forEach((r) => (counts[r.range] = 0));

  completed.forEach((s) => {
    const score = s.totalScore || 0;
    for (const r of ranges) {
      if (score >= r.min && score < r.max) {
        counts[r.range]++;
        break;
      }
    }
  });

  const data = ranges.map((r) => ({ range: r.range, count: counts[r.range] }));

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, data, 'Score distribution fetched.')
  );
});

const getRoundStats = asyncHandler(async (req, res) => {
  const stats = await Session.aggregate([
    { $unwind: '$rounds' },
    {
      $group: {
        _id: '$rounds.roundNumber',
        avgScore: { $avg: '$rounds.score' },
        avgTime: { $avg: '$rounds.answers.timeTaken' },
        total: { $sum: 1 },
        passed: {
          $sum: { $cond: ['$rounds.passed', 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const data = stats.map((s) => ({
    round: s._id,
    roundName: ROUNDS.NAMES[s._id - 1] || `Round ${s._id}`,
    avgScore: Math.round(s.avgScore || 0),
    total: s.total,
    passRate: s.total > 0 ? Math.round((s.passed / s.total) * 100) : 0,
  }));

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, data, 'Round stats fetched.')
  );
});

const getOverview = asyncHandler(async (req, res) => {
  const [totalSessions, completedSessions, activeUsers, totalQuestions] = await Promise.all([
    Session.countDocuments(),
    Session.countDocuments({ status: 'completed' }),
    User.countDocuments({ isActive: true }),
    Question.countDocuments({ isActive: true }),
  ]);

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, {
      totalSessions,
      completedSessions,
      completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
      activeUsers,
      totalQuestions,
    }, 'Overview fetched.')
  );
});

module.exports = { getAnalytics, getScoreDistribution, getRoundStats, getOverview };
