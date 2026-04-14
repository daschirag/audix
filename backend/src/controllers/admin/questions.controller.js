const Question = require('../../models/Question');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { HTTP, ROUNDS } = require('../../config/constants');

// ── GET ALL QUESTIONS ──────────────────────────────────────────────
const getQuestions = asyncHandler(async (req, res) => {
  const {
    round,
    difficulty,
    type,
    isActive,
    page = 1,
    limit = 20,
  } = req.query;

  const filter = {};
  if (round)      filter.round = parseInt(round);
  if (difficulty) filter.difficulty = difficulty;
  if (type)       filter.type = type;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [questions, total] = await Promise.all([
    Question.find(filter)
      .populate('createdBy', 'name email')
      .sort({ round: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Question.countDocuments(filter),
  ]);

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, {
      questions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    }, 'Questions fetched successfully.')
  );
});

// ── GET SINGLE QUESTION ────────────────────────────────────────────
const getQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id)
    .populate('createdBy', 'name email');

  if (!question) {
    throw new ApiError(HTTP.NOT_FOUND, 'Question not found.');
  }

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, { question }, 'Question fetched.')
  );
});

// ── CREATE QUESTION ────────────────────────────────────────────────
const createQuestion = asyncHandler(async (req, res) => {
  const {
    round, type, question, options,
    correctOrder, explanation, piiFields,
    difficulty, imageUrl,
  } = req.body;

  // Auto-set roundName from constants
  const roundName = ROUNDS.NAMES[round - 1];

  const newQuestion = await Question.create({
    round,
    roundName,
    type,
    question,
    options: options || [],
    correctOrder: correctOrder || [],
    explanation,
    piiFields: piiFields || [],
    difficulty,
    imageUrl,
    createdBy: req.user._id,
  });

  return res.status(HTTP.CREATED).json(
    new ApiResponse(HTTP.CREATED, { question: newQuestion },
      'Question created successfully.')
  );
});

// ── UPDATE QUESTION ────────────────────────────────────────────────
const updateQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) {
    throw new ApiError(HTTP.NOT_FOUND, 'Question not found.');
  }

  const allowedUpdates = [
    'question', 'options', 'correctOrder', 'explanation',
    'piiFields', 'difficulty', 'imageUrl', 'isActive', 'type',
  ];

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      question[field] = req.body[field];
    }
  });

  await question.save();

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, { question }, 'Question updated successfully.')
  );
});

// ── DELETE QUESTION (soft delete — set isActive: false) ────────────
const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) {
    throw new ApiError(HTTP.NOT_FOUND, 'Question not found.');
  }

  // Soft delete — preserve for audit; excluded from game queries
  question.isActive = false;
  await question.save();

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, null, 'Question deactivated successfully.')
  );
});

// ── TOGGLE ACTIVE STATUS ───────────────────────────────────────────
const toggleQuestionStatus = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) {
    throw new ApiError(HTTP.NOT_FOUND, 'Question not found.');
  }

  question.isActive = !question.isActive;
  await question.save();

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, { isActive: question.isActive },
      `Question ${question.isActive ? 'activated' : 'deactivated'}.`)
  );
});

// ── GET QUESTIONS STATS (per round) ───────────────────────────────
const getQuestionStats = asyncHandler(async (req, res) => {
  const stats = await Question.aggregate([
    {
      $group: {
        _id: '$round',
        total: { $sum: 1 },
        active: { $sum: { $cond: ['$isActive', 1, 0] } },
        easy: { $sum: { $cond: [{ $eq: ['$difficulty', 'easy'] }, 1, 0] } },
        medium: { $sum: { $cond: [{ $eq: ['$difficulty', 'medium'] }, 1, 0] } },
        hard: { $sum: { $cond: [{ $eq: ['$difficulty', 'hard'] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, { stats }, 'Question stats fetched.')
  );
});

// ── BULK CREATE QUESTIONS (JSON array) ─────────────────────────────
const bulkCreateQuestions = asyncHandler(async (req, res) => {
  const questionsData = req.body;

  if (!Array.isArray(questionsData) || questionsData.length === 0) {
    throw new ApiError(HTTP.BAD_REQUEST, 'Expected array of questions.');
  }

  const inserted = [];
  const failed = [];

  for (const q of questionsData) {
    try {
      const roundName = ROUNDS.NAMES[q.round - 1];
      const question = await Question.create({
        round: q.round,
        roundName,
        type: q.type,
        question: q.question,
        options: q.options || [],
        correctOrder: q.correctOrder || [],
        explanation: q.explanation || '',
        piiFields: q.piiFields || [],
        difficulty: q.difficulty || 'medium',
        imageUrl: q.imageUrl || null,
        createdBy: req.user._id,
      });
      inserted.push(question._id);
    } catch (err) {
      failed.push({
        question: q.question?.substring(0, 50),
        error: err.message,
      });
    }
  }

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, {
      inserted: inserted.length,
      failed: failed.length,
      details: { inserted, failed },
    }, `Bulk upload: ${inserted.length} inserted, ${failed.length} failed.`)
  );
});

module.exports = {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  toggleQuestionStatus,
  getQuestionStats,
  bulkCreateQuestions,
};