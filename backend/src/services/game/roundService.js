const Question = require('../../models/Question');
const GameSession = require('../../models/GameSession');
const { ROUNDS } = require('../../config/constants');
const ApiError = require('../../utils/ApiError');
const { HTTP } = require('../../config/constants');

const getQuestionsForRound = async (round, count = null) => {
  const numQuestions = count || ROUNDS.QUESTIONS_PER_ROUND;

  // Fetch more questions than needed, then randomly select (single DB call)
  const questions = await Question.find({ round, isActive: true })
    .select('_id round type question options difficulty imageUrl piiFields explanation')
    .lean()
    .exec();

  if (questions.length < 3) {
    throw new ApiError(
      HTTP.BAD_REQUEST,
      `Not enough active questions for round ${round}. Need at least 3, found ${questions.length}.`
    );
  }

  // Fisher-Yates shuffle and take first numQuestions
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }

  return questions.slice(0, numQuestions);
};

const createGameSession = async (userId, sessionId) => {
  const gameSession = await GameSession.create({
    sessionId,
    userId,
    round: 1,
    questionIds: [],
    currentIndex: 0,
    timeLimit: ROUNDS.TIME_LIMIT_SECONDS,
    isCompleted: false,
  });

  return gameSession;
};

const startRound = async (gameSession, roundNumber) => {
  const questions = await getQuestionsForRound(roundNumber);

  gameSession.round = roundNumber;
  gameSession.questionIds = questions.map((q) => q._id);
  gameSession.currentIndex = 0;
  gameSession.isCompleted = false;
  gameSession.expiresAt = new Date(Date.now() + ROUNDS.TIME_LIMIT_SECONDS * 1000);
  await gameSession.save();

  // Return questions without revealing correct answers
  const safeQuestions = questions.map((q) => {
    const opts = q.options?.map((o) => ({ text: o.text }));
    return {
      _id: q._id,
      round: q.round,
      type: q.type,
      question: q.question,
      options: opts,
      difficulty: q.difficulty,
      imageUrl: q.imageUrl,
      piiFields: q.piiFields,
    };
  });

  return { gameSession, questions: safeQuestions };
};

module.exports = { getQuestionsForRound, createGameSession, startRound };
