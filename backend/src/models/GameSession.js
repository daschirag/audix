const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  round: { type: Number, required: true },
  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  currentIndex: { type: Number, default: 0 },
  timeLimit: { type: Number },
  expiresAt: { type: Date },
  isCompleted: { type: Boolean, default: false },
}, { timestamps: true });

gameSessionSchema.index({ sessionId: 1 });
gameSessionSchema.index({ userId: 1 });
gameSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('GameSession', gameSessionSchema);