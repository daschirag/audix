const Leaderboard = require('../../models/Leaderboard');
const Session = require('../../models/Session');

const updateLeaderboard = async (userId) => {
  const completedSessions = await Session.find({
    userId,
    status: 'completed',
  }).sort({ totalScore: -1 });

  if (completedSessions.length === 0) return null;

  const bestSession = completedSessions[0];
  const totalRounds = bestSession.rounds?.length || 0;
  const completedRounds = bestSession.rounds?.filter((r) => r.passed).length || 0;

  const badges = [];
  if (bestSession.totalScore >= 3000) badges.push('Cyber Elite');
  if (bestSession.totalScore >= 2000) badges.push('Security Expert');
  if (bestSession.totalScore >= 1000) badges.push('Rising Defender');
  if (completedRounds === 6) badges.push('All Rounds Complete');

  await Leaderboard.findOneAndUpdate(
    { userId },
    {
      totalScore: bestSession.totalScore,
      roundsCompleted: completedRounds,
      badges,
      lastUpdated: new Date(),
    },
    { upsert: true, new: true }
  );

  await recalculateRanks();

  return Leaderboard.findOne({ userId });
};

const recalculateRanks = async () => {
  const entries = await Leaderboard.find().sort({ totalScore: -1 });
  const bulkOps = entries.map((entry, index) => ({
    updateOne: {
      filter: { _id: entry._id },
      update: { $set: { rank: index + 1 } },
    },
  }));

  if (bulkOps.length > 0) {
    await Leaderboard.bulkWrite(bulkOps);
  }
};

const getLeaderboard = async (limit = 50) => {
  await recalculateRanks();

  return Leaderboard.find()
    .populate('userId', 'name email department avatar')
    .sort({ rank: 1 })
    .limit(limit);
};

const getUserRank = async (userId) => {
  await recalculateRanks();
  return Leaderboard.findOne({ userId }).populate('userId', 'name email department');
};

module.exports = { updateLeaderboard, getLeaderboard, getUserRank, recalculateRanks };
