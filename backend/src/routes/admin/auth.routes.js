const express = require('express');
const router = express.Router();
const { login, logout, refreshToken, getMe, bootstrap } = require('../../controllers/admin/auth.controller');
const { verifyJWT } = require('../../middlewares/auth.middleware');

router.post('/bootstrap',     bootstrap);
router.post('/login',         login);
router.post('/logout',        verifyJWT, logout);
router.post('/refresh-token', refreshToken);
router.get('/me',             verifyJWT, getMe);

module.exports = router;
