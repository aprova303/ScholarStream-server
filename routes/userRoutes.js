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
const { verifyFirebaseToken, verifyAdmin } = require('../config/auth');

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
router.get('/', verifyAdmin, getAllUsers);

/**
 * Admin only - Update user role
 */
router.patch('/:userId/role', verifyAdmin, updateUserRole);

/**
 * Admin only - Get users by role
 */
router.get('/role/:role', verifyAdmin, getUsersByRole);

/**
 * Admin only - Delete user
 */
router.delete('/:userId', verifyAdmin, deleteUser);

module.exports = router;
