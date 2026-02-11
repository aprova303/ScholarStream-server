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
const { verifyFirebaseToken, verifyRoleAndToken, verifyModerator, verifyAdmin } = require('../config/auth');

/**
 * Student routes
 */
router.post('/', verifyFirebaseToken, verifyRoleAndToken('Student'), createApplication);
router.get('/my-applications', verifyFirebaseToken, verifyRoleAndToken('Student'), getMyApplications);
router.delete('/:id', verifyFirebaseToken, verifyRoleAndToken('Student'), deleteApplication);

/**
 * Moderator/Admin routes - Get all applications
 */
router.get('/all', verifyFirebaseToken, verifyModerator, getAllApplications);

/**
 * Moderator/Admin routes - Update application status
 */
router.patch('/:id/status', verifyFirebaseToken, verifyModerator, updateApplicationStatus);

/**
 * Admin only - Update payment status
 */
router.patch('/:id/payment', verifyFirebaseToken, verifyAdmin, updatePaymentStatus);

/**
 * Public route - Get application by ID
 */
router.get('/:id', getApplicationById);

module.exports = router;
