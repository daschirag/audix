const express = require('express');
const router = express.Router();
const {
  getQuestions, getQuestion, createQuestion,
  updateQuestion, deleteQuestion,
  toggleQuestionStatus, getQuestionStats,
  bulkCreateQuestions,
} = require('../../controllers/admin/questions.controller');
const { verifyJWT, requireAdmin } = require('../../middlewares/auth.middleware');

router.use(verifyJWT, requireAdmin);

router.get('/stats',        getQuestionStats);
router.get('/',             getQuestions);
router.get('/:id',          getQuestion);
router.post('/',            createQuestion);
router.post('/bulk',        bulkCreateQuestions);
router.post('/bulk/json',   bulkCreateQuestions);
router.patch('/:id',        updateQuestion);
router.delete('/:id',       deleteQuestion);
router.patch('/:id/toggle', toggleQuestionStatus);

module.exports = router;