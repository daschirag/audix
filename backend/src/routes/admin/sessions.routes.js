const express = require('express');
const router = express.Router();
const {
  getSessions, getSession, getSessionsByUser,
  terminateSession, getSessionStats, resetSession,
} = require('../../controllers/admin/sessions.controller');
const { verifyJWT, requireAdmin } = require('../../middlewares/auth.middleware');

router.use(verifyJWT, requireAdmin);

router.get('/stats',              getSessionStats);
router.get('/',                   getSessions);
router.get('/:id',                getSession);
router.get('/user/:userId',       getSessionsByUser);
router.patch('/:id/terminate',    terminateSession);
router.patch('/:id/reset',        resetSession);

module.exports = router;