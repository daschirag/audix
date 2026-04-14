const User = require('../../models/User');
const Session = require('../../models/Session');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { HTTP } = require('../../config/constants');

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password -refreshToken -passwordResetToken -loginAttempts -lockUntil -passwordResetExpires');

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, { user }, 'Profile fetched.')
  );
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, department } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(HTTP.NOT_FOUND, 'User not found.');

  if (name) user.name = name;
  if (department !== undefined) user.department = department;

  await user.save({ validateBeforeSave: false });

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        isEmailVerified: user.isEmailVerified,
        totalGamesPlayed: user.totalGamesPlayed,
        highestScore: user.highestScore,
        lastPlayedAt: user.lastPlayedAt,
      },
    }, 'Profile updated.')
  );
});

const getMyStats = asyncHandler(async (req, res) => {
  const [completedSessions, totalSessions, bestSession] = await Promise.all([
    Session.countDocuments({ userId: req.user._id, status: 'completed' }),
    Session.countDocuments({ userId: req.user._id }),
    Session.findOne({ userId: req.user._id, status: 'completed' }).sort({ totalScore: -1 }),
  ]);

  const roundsPassed = bestSession?.rounds?.filter((r) => r.passed).length || 0;

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, {
      gamesPlayed: completedSessions,
      totalSessions,
      highestScore: bestSession?.totalScore || 0,
      bestRoundsPassed: roundsPassed,
      lastPlayed: req.user.lastPlayedAt,   // frontend reads lastPlayed
      lastPlayedAt: req.user.lastPlayedAt,
    }, 'Stats fetched.')
  );
});

module.exports = { getProfile, updateProfile, getMyStats };
