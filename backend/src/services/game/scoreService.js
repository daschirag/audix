const { SCORING, ROUNDS } = require('../../config/constants');

const calculateQuestionScore = ({ isCorrect, timeTaken, roundNumber }) => {
  if (!isCorrect) return { points: SCORING.WRONG_ANSWER_PENALTY, isCorrect: false };

  // Round 3 (PII Identification) has a higher base score to allow 700 max
  const base = roundNumber === 3 ? SCORING.ROUND3_BASE_SCORE : SCORING.BASE_SCORE;

  let points = base;

  // Early submit bonus: awarded for answering in < 50% of time limit
  const timeLimit = ROUNDS.TIME_LIMIT_SECONDS;
  if (timeTaken < timeLimit * 0.5) {
    points += SCORING.EARLY_SUBMIT_BONUS;
  }

  return { points, isCorrect: true };
};

const calculateRoundScore = (answers) => {
  let score = 0;
  let correct = 0;
  let total = answers.length;

  answers.forEach((a) => {
    score += a.pointsEarned || 0;
    if (a.isCorrect) correct++;
  });

  const passed = correct >= Math.ceil(total * 0.6); // 60% pass threshold

  return { score, correct, total, passed };
};

const calculateTotalScore = (rounds) => {
  return rounds.reduce((sum, r) => sum + (r.score || 0), 0);
};

const getStarRating = (percentage) => {
  const { STAR_RATING } = require('../../config/constants');
  if (percentage >= STAR_RATING.THREE_STAR.min) return { stars: 3, title: STAR_RATING.THREE_STAR.title };
  if (percentage >= STAR_RATING.TWO_STAR.min) return { stars: 2, title: STAR_RATING.TWO_STAR.title };
  return { stars: 1, title: STAR_RATING.ONE_STAR.title };
};

module.exports = {
  calculateQuestionScore,
  calculateRoundScore,
  calculateTotalScore,
  getStarRating,
};
