// User Routes
const express = require('express');
const router = express.Router();
const {
  createOrUpdateUser,
  getUserByEmail,
  getUserRole,
  getAllUsers,
  updateUserRole,
  getUsersByRole,
  deleteUser
} = require('../controllers/userController');
const { verifyFirebaseToken, verifyRoleAndToken } = require('../config/auth');

/**
 * Public route - Create or update user
 * Called when user registers or logs in
 */
router.post('/create-or-update', verifyFirebaseToken, createOrUpdateUser);

/**
 * Public route - Get user by email
 */
router.get('/:email/role', getUserRole);

/**
 * Public route - Get user by email
 */
router.get('/:email', getUserByEmail);

/**
 * Admin only - Get all users
 */
router.get('/', verifyRoleAndToken('Admin'), getAllUsers);

/**
 * Admin only - Update user role
 */
router.patch('/:userId/role', verifyRoleAndToken('Admin'), updateUserRole);

/**
 * Admin only - Get users by role
 */
router.get('/role/:role', verifyRoleAndToken('Admin'), getUsersByRole);

/**
 * Admin only - Delete user
 */
router.delete('/:userId', verifyRoleAndToken('Admin'), deleteUser);

module.exports = router;
