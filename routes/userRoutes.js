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
 * Admin only - Get all users (must be before :email routes)
 */
router.get('/', verifyAdmin, getAllUsers);

/**
 * Public route - Create or update user
 * Called when user registers or logs in
 */
router.post('/create-or-update', verifyFirebaseToken, createOrUpdateUser);

/**
 * Admin only - Get users by role (must be before /:email routes)
 */
router.get('/role/:role', verifyAdmin, getUsersByRole);

/**
 * Public route - Get user role by email
 */
router.get('/:email/role', getUserRole);

/**
 * Public route - Get user by email
 */
router.get('/:email', getUserByEmail);

/**
 * Admin only - Update user role
 */
router.patch('/:userId/role', verifyAdmin, updateUserRole);

/**
 * Admin only - Delete user
 */
router.delete('/:userId', verifyAdmin, deleteUser);

module.exports = router;
