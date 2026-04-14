const mongoose = require('mongoose');
const { SESSION_STATUS, ROUNDS } = require('../config/constants');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  selectedOption: { type: mongoose.Schema.Types.Mixed },
  isCorrect: { type: Boolean, default: false },
  timeTaken: { type: Number, default: 0 },
  pointsEarned: { type: Number, default: 0 },
}, { _id: false });

const roundSchema = new mongoose.Schema({
  roundNumber: { type: Number, required: true },
  roundName: { type: String },
  startedAt: { type: Date },
  completedAt: { type: Date },
  score: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
  answers: [answerSchema],
}, { _id: false });

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(SESSION_STATUS),
    default: SESSION_STATUS.PENDING,
  },
  currentRound: { type: Number, default: 1, min: 1, max: ROUNDS.TOTAL },
  totalScore: { type: Number, default: 0 },
  rounds: [roundSchema],
  startedAt: { type: Date },
  completedAt: { type: Date },
  terminatedAt: { type: Date },
  terminatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

sessionSchema.index({ userId: 1, createdAt: -1 });
sessionSchema.index({ status: 1 });

module.exports = mongoose.model('Session', sessionSchema);