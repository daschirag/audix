const express = require('express');
const router = express.Router();
const {
  getUsers, getUser, updateUser,
  deleteUser, toggleUserStatus,
  unlockUser, getUserStats, changeUserRole,
} = require('../../controllers/admin/users.controller');
const { verifyJWT, requireAdmin } = require('../../middlewares/auth.middleware');

router.use(verifyJWT, requireAdmin);

router.get('/stats',          getUserStats);
router.get('/',               getUsers);
router.get('/:id',            getUser);
router.patch('/:id',          updateUser);
router.delete('/:id',         deleteUser);
router.patch('/:id/toggle',   toggleUserStatus);
router.patch('/:id/unlock',   unlockUser);
router.put('/:id/role',       changeUserRole);

module.exports = router;