const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  totalScore: { type: Number, default: 0 },
  roundsCompleted: { type: Number, default: 0 },
  rank: { type: Number },
  badges: [{ type: String }],
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

leaderboardSchema.index({ totalScore: -1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);