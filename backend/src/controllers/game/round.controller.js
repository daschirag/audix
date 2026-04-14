const Session = require('../../models/Session');
const GameSession = require('../../models/GameSession');
const Question = require('../../models/Question');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { getQuestionsForRound } = require('../../services/game/roundService');
const { calculateQuestionScore, calculateRoundScore } = require('../../services/game/scoreService');
const { SESSION_STATUS, ROUNDS, SCORING, HTTP } = require('../../config/constants');

// ── START ROUND ────────────────────────────────────────────────────
// FIX: was calling startRound(null, roundNumber) which crashed;
//      now we find/create the GameSession ourselves.
const startNewRound = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;
  const roundNumber = parseInt(req.body.round) || 1;

  if (!req.user || !req.user._id) {
    throw new ApiError(HTTP.UNAUTHORIZED, 'User not authenticated');
  }

  if (roundNumber < 1 || roundNumber > ROUNDS.TOTAL) {
    throw new ApiError(HTTP.BAD_REQUEST, `Round must be between 1 and ${ROUNDS.TOTAL}.`);
  }

  if (!sessionId) {
    throw new ApiError(HTTP.BAD_REQUEST, 'Session ID is required');
  }

  // Fetch session and existing GameSession in parallel
  const [session, existingGameSession] = await Promise.all([
    Session.findById(sessionId),
    GameSession.findOne({
      sessionId,
      round: roundNumber,
      isCompleted: false,
    }),
  ]);

  if (!session) throw new ApiError(HTTP.NOT_FOUND, 'Session not found.');
  
  // Allow if session is pending/new (no userId set yet) or belongs to user
  if (session.userId && session.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(HTTP.FORBIDDEN, 'Not your session.');
  }
  
  // Assign session to user if not already assigned
  if (!session.userId) {
    session.userId = req.user._id;
  }

  // Activate session on first round
  session.status = SESSION_STATUS.ACTIVE;
  session.currentRound = roundNumber;
  if (roundNumber === 1 && !session.startedAt) session.startedAt = new Date();

  // Fetch questions and save session in parallel
  const [questions] = await Promise.all([
    getQuestionsForRound(roundNumber),
    session.save(),
  ]);

  let gameSession = existingGameSession;
  if (!gameSession) {
    gameSession = await GameSession.create({
      sessionId,
      userId: req.user._id,
      round: roundNumber,
      questionIds: questions.map((q) => q._id),
      currentIndex: 0,
      timeLimit: ROUNDS.TIME_LIMIT_SECONDS,
      expiresAt: new Date(Date.now() + ROUNDS.TIME_LIMIT_SECONDS * 1000),
      isCompleted: false,
    });
  } else {
    // Update existing with fresh questions
    gameSession.questionIds = questions.map((q) => q._id);
    gameSession.currentIndex = 0;
    gameSession.expiresAt = new Date(Date.now() + ROUNDS.TIME_LIMIT_SECONDS * 1000);
    await gameSession.save();
  }

  // Strip correct answers before sending to client
  const safeQuestions = questions.map((q) => ({
    _id: q._id,
    round: q.round,
    type: q.type,
    question: q.question,
    options: q.options?.map((o) => ({ _id: o._id, text: o.text })),
    items: q.type === 'ordering' ? q.options?.map((o) => o.text) : undefined,
    correctOrder: q.type === 'ordering' ? q.correctOrder : undefined,
    difficulty: q.difficulty,
    imageUrl: q.imageUrl,
    piiFields: q.piiFields,
    explanation: undefined, // not revealed until answer submitted
  }));

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, {
      round: roundNumber,
      roundName: ROUNDS.NAMES[roundNumber - 1],
      questions: safeQuestions,
      timeLimit: ROUNDS.TIME_LIMIT_SECONDS,
      gameSessionId: gameSession._id,
    }, `Round ${roundNumber} started.`)
  );
});

// ── SUBMIT ANSWER ──────────────────────────────────────────────────
const submitAnswer = asyncHandler(async (req, res) => {
  const { gameSessionId, questionId, selectedOption, timeTaken } = req.body;

  const gameSession = await GameSession.findById(gameSessionId);
  if (!gameSession) throw new ApiError(HTTP.NOT_FOUND, 'Game session not found.');
  if (gameSession.isCompleted) throw new ApiError(HTTP.BAD_REQUEST, 'Round already completed.');

  const question = await Question.findById(questionId);
  if (!question) throw new ApiError(HTTP.NOT_FOUND, 'Question not found.');

  let isCorrect = false;
  let correctIndex = null;
  let selectedIndex = null;

  switch (question.type) {
    case 'multiple-choice': {
      const correctOption = question.options?.find((o) => o.isCorrect);
      correctIndex = question.options?.findIndex((o) => o.isCorrect) ?? null;
      
      // selectedOption comes as index from frontend
      selectedIndex = parseInt(selectedOption);
      isCorrect = selectedIndex === correctIndex;
      break;
    }
    case 'text-input': {
      const correctOption = question.options?.find((o) => o.isCorrect);
      isCorrect = !!(correctOption &&
        correctOption.text?.toLowerCase().trim() === selectedOption?.toLowerCase().trim());
      break;
    }
    case 'ordering': {
      const correctOrder = question.correctOrder || [];
      const selected = Array.isArray(selectedOption)
        ? selectedOption
        : (selectedOption?.split(',') || []);
      isCorrect = JSON.stringify(correctOrder) === JSON.stringify(selected.map((s) => s.trim()));
      break;
    }
    case 'chat-response': {
      isCorrect = !!(selectedOption && selectedOption.trim().length > 5);
      break;
    }
    default:
      isCorrect = false;
  }

  const { points } = calculateQuestionScore({
    isCorrect,
    timeTaken: timeTaken || 0,
    roundNumber: gameSession.round,
    questionType: question.type,
  });

  gameSession.currentIndex += 1;
  if (gameSession.currentIndex >= gameSession.questionIds.length) {
    gameSession.isCompleted = true;
  }
  await gameSession.save();

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, {
      isCorrect,
      pointsEarned: points,
      explanation: question.explanation,
      correctIndex,
      correctText: question.options?.[correctIndex]?.text,
      selectedIndex,
      isRoundComplete: gameSession.isCompleted,
      nextQuestionIndex: gameSession.currentIndex,
      totalQuestions: gameSession.questionIds.length,
    }, 'Answer submitted.')
  );
});

// ── COMPLETE ROUND ─────────────────────────────────────────────────
const completeRound = asyncHandler(async (req, res) => {
  const { gameSessionId, sessionId, round, answers } = req.body;

  // Find game session by id OR by sessionId + round (frontend may not send gameSessionId)
  let gameSession;
  if (gameSessionId) {
    gameSession = await GameSession.findById(gameSessionId);
  } else if (sessionId && round) {
    gameSession = await GameSession.findOne({
      sessionId,
      round: parseInt(round),
    }).sort({ createdAt: -1 });
  }
  if (!gameSession) throw new ApiError(HTTP.NOT_FOUND, 'Game session not found.');

  const session = await Session.findById(sessionId || gameSession.sessionId);
  if (!session) throw new ApiError(HTTP.NOT_FOUND, 'Session not found.');

  // Normalize answers — frontend sends { questionId, answer, isCorrect, timeRemaining }
  // backend expects  { questionId, selectedOption, isCorrect, timeTaken, pointsEarned }
  const normalizedAnswers = (answers || []).map((a) => ({
    questionId: a.questionId,
    selectedOption: a.selectedOption || a.answer,
    isCorrect: !!a.isCorrect,
    timeTaken: a.timeTaken != null
      ? a.timeTaken
      : Math.max(0, ROUNDS.TIME_LIMIT_SECONDS - (a.timeRemaining || 0)),
    pointsEarned: a.pointsEarned != null
      ? a.pointsEarned
      : (a.isCorrect ? SCORING.BASE_SCORE : 0),
  }));

  const { score, passed } = calculateRoundScore(normalizedAnswers);

  const roundData = {
    roundNumber: gameSession.round,
    roundName: ROUNDS.NAMES[gameSession.round - 1],
    startedAt: gameSession.createdAt,
    completedAt: new Date(),
    score,
    passed,
    answers: normalizedAnswers,
  };

  const existingIdx = session.rounds.findIndex((r) => r.roundNumber === gameSession.round);
  if (existingIdx >= 0) {
    session.rounds[existingIdx] = roundData;
  } else {
    session.rounds.push(roundData);
  }

  session.totalScore = session.rounds.reduce((sum, r) => sum + (r.score || 0), 0);

  const allRoundsDone = session.rounds.length >= ROUNDS.TOTAL;
  const nextRound = gameSession.round + 1;

  if (allRoundsDone) {
    session.status = SESSION_STATUS.COMPLETED;
    session.completedAt = new Date();
    gameSession.isCompleted = true;

    const User = require('../../models/User');
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalGamesPlayed: 1 },
      $set: { lastPlayedAt: new Date() },
      $max: { highestScore: session.totalScore },
    });

    const { updateLeaderboard } = require('../../services/game/leaderboardService');
    await updateLeaderboard(req.user._id);
  } else {
    session.currentRound = nextRound;
  }

  await session.save();
  await gameSession.save();

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, {
      round: roundData,
      totalScore: session.totalScore,
      isGameComplete: allRoundsDone,
      nextRound: allRoundsDone ? null : nextRound,
      roundsCompleted: session.rounds.length,
    }, allRoundsDone ? 'Game completed!' : `Round ${gameSession.round} completed.`)
  );
});

module.exports = { startNewRound, submitAnswer, completeRound };
