const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../../middlewares/auth.middleware');
const auditLogger = require('../../middlewares/auditLogger');

const { createSession, getActiveSession, endSession, getSessionHistory, getSessionDetail } = require('../../controllers/game/session.controller');
const { startNewRound, submitAnswer, completeRound } = require('../../controllers/game/round.controller');
const { getMyScore, getRoundBreakdown } = require('../../controllers/game/score.controller');
const { getQuestionsForRound } = require('../../controllers/game/questions.controller');

router.use(verifyJWT);

// Session management
router.post('/session',                   auditLogger('game-session'), createSession);
router.get('/session/active',             getActiveSession);
router.get('/session/history',            getSessionHistory);
router.get('/session/:id',                getSessionDetail);
router.post('/session/:id/end',           auditLogger('game-session'), endSession);

// Round management
router.post('/round/start',               auditLogger('game-round'), startNewRound);
router.post('/round/answer',              auditLogger('game-answer'), submitAnswer);
router.post('/round/complete',            auditLogger('game-round'), completeRound);

// Questions
router.get('/questions/:roundNumber',     getQuestionsForRound);

// Score
router.get('/score',                      getMyScore);
router.get('/score/:sessionId/breakdown', getRoundBreakdown);

module.exports = router;
