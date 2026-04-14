const User = require('../../models/User');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const asyncHandler = require('../../utils/asyncHandler');
const { HTTP, ROLES } = require('../../config/constants');

// ── GET ALL USERS ──────────────────────────────────────────────────
const getUsers = asyncHandler(async (req, res) => {
  const {
    role,
    department,
    isActive,
    search,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    order = 'desc',
  } = req.query;

  const filter = {};
  if (role)       filter.role = role;
  if (department) filter.department = department;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) {
    filter.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'asc' ? 1 : -1;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password -refreshToken -passwordResetToken')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(filter),
  ]);

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, {
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    }, 'Users fetched successfully.')
  );
});

// ── GET SINGLE USER ────────────────────────────────────────────────
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -refreshToken -passwordResetToken');

  if (!user) {
    throw new ApiError(HTTP.NOT_FOUND, 'User not found.');
  }

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, { user }, 'User fetched.')
  );
});

// ── UPDATE USER ────────────────────────────────────────────────────
const updateUser = asyncHandler(async (req, res) => {
  const { name, department, isActive } = req.body;

  // CRITICAL: Admin cannot change role via this endpoint
  // Role changes require direct DB access (security measure)
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(HTTP.NOT_FOUND, 'User not found.');
  }

  // Prevent admin from deactivating themselves
  if (req.params.id === req.user._id.toString() && isActive === false) {
    throw new ApiError(HTTP.BAD_REQUEST, 'You cannot deactivate your own account.');
  }

  if (name !== undefined)       user.name = name;
  if (department !== undefined) user.department = department;
  if (isActive !== undefined)   user.isActive = isActive;

  await user.save({ validateBeforeSave: false });

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, { user }, 'User updated successfully.')
  );
});

// ── DELETE USER ────────────────────────────────────────────────────
const deleteUser = asyncHandler(async (req, res) => {
  // Prevent admin from deleting themselves
  if (req.params.id === req.user._id.toString()) {
    throw new ApiError(HTTP.BAD_REQUEST, 'You cannot delete your own account.');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(HTTP.NOT_FOUND, 'User not found.');
  }

  // Prevent deleting other admins
  if (user.role === ROLES.ADMIN) {
    throw new ApiError(HTTP.FORBIDDEN, 'Cannot delete another admin account.');
  }

  await User.findByIdAndDelete(req.params.id);

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, null, 'User deleted successfully.')
  );
});

// ── TOGGLE USER STATUS ─────────────────────────────────────────────
const toggleUserStatus = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    throw new ApiError(HTTP.BAD_REQUEST, 'You cannot deactivate your own account.');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(HTTP.NOT_FOUND, 'User not found.');
  }

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, { isActive: user.isActive },
      `User ${user.isActive ? 'activated' : 'deactivated'}.`)
  );
});

// ── UNLOCK USER ACCOUNT ────────────────────────────────────────────
const unlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(HTTP.NOT_FOUND, 'User not found.');
  }

  await user.resetLoginAttempts();

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, null, 'User account unlocked successfully.')
  );
});

// ── GET USER STATS ─────────────────────────────────────────────────
const getUserStats = asyncHandler(async (req, res) => {
  const [total, active, admins, departments] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: ROLES.ADMIN }),
    User.distinct('department'),
  ]);

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, {
      total,
      active,
      inactive: total - active,
      admins,
      users: total - admins,
      departments: departments.filter(Boolean),
    }, 'User stats fetched.')
  );
});

// ── CHANGE USER ROLE ───────────────────────────────────────────────
const changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!role || !Object.values(ROLES).includes(role)) {
    throw new ApiError(HTTP.BAD_REQUEST, `Role must be one of: ${Object.values(ROLES).join(', ')}.`);
  }

  // Cannot change your own role
  if (req.params.id === req.user._id.toString()) {
    throw new ApiError(HTTP.BAD_REQUEST, 'You cannot change your own role.');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(HTTP.NOT_FOUND, 'User not found.');
  }

  user.role = role;
  await user.save({ validateBeforeSave: false });

  return res.status(HTTP.OK).json(
    new ApiResponse(HTTP.OK, { _id: user._id, email: user.email, role: user.role },
      `User role updated to '${role}'.`)
  );
});

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  unlockUser,
  getUserStats,
  changeUserRole,
};