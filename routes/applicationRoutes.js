// Application Routes
const express = require('express');
const router = express.Router();
const {
  createApplication,
  getMyApplications,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  updatePaymentStatus,
  deleteApplication
} = require('../controllers/applicationController');
const { verifyRoleAndToken, verifyModerator, verifyAdmin } = require('../config/auth');

/**
 * Student routes
 */
router.post('/', verifyRoleAndToken('Student'), createApplication);
router.get('/my-applications', verifyRoleAndToken('Student'), getMyApplications);
router.delete('/:id', verifyRoleAndToken('Student'), deleteApplication);

/**
 * Moderator/Admin routes - Get all applications
 */
router.get('/all', verifyModerator, getAllApplications);

/**
 * Moderator/Admin routes - Update application status
 */
router.patch('/:id/status', verifyModerator, updateApplicationStatus);

/**
 * Admin only - Update payment status
 */
router.patch('/:id/payment', verifyAdmin, updatePaymentStatus);

/**
 * Public route - Get application by ID
 */
router.get('/:id', getApplicationById);

module.exports = router;
