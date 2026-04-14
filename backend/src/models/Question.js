const mongoose = require('mongoose');
const { ROUNDS } = require('../config/constants');

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  isCorrect: { type: Boolean, required: true, default: false },
}, { _id: true });

const questionSchema = new mongoose.Schema(
  {
    round: {
      type: Number,
      required: [true, 'Round number is required'],
      min: 1,
      max: ROUNDS.TOTAL,
    },
    roundName: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'multiple-choice',   // Round 1, 3, 4, 5
        'chat-response',     // Round 2 — Social Engineering
        'ordering',          // Round 6 — Incident Response
        'text-input',        // Password creation
      ],
      required: true,
    },
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      maxlength: [1000, 'Question too long'],
    },
    options: {
      type: [optionSchema],
      default: [],
    },
    correctOrder: {
      type: [String],  // For ordering type (Round 6)
      default: [],
    },
    explanation: {
      type: String,
      trim: true,
      maxlength: [500, 'Explanation too long'],
    },

    // ── PII METADATA (Round 2) ──────────────────────────────────
    piiFields: {
      type: [String],  // Which PII fields this question tests
      default: [],
    },

    // ── DIFFICULTY ───────────────────────────────────────────────
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },

    // ── MEDIA (optional screenshot for Round 5) ──────────────────
    imageUrl: {
      type: String,
      default: null,
    },

    // ── STATUS ───────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ── INDEXES ────────────────────────────────────────────────────────
questionSchema.index({ round: 1, isActive: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ type: 1 });

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;