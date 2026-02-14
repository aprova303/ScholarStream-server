// Application Routes
const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const {
  createApplication,
  getMyApplications,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  updateApplicationFeedback,
  updatePaymentStatus,
  deleteApplication
} = require('../controllers/applicationController');
const { verifyFirebaseToken, verifyRoleAndToken, verifyModerator, verifyAdmin } = require('../config/auth');

/**
 * MORE SPECIFIC ROUTES FIRST (to avoid being shadowed by /:id)
 */

/**
 * Student route - Get my applications (requires authentication)
 */
router.get('/my-applications', verifyFirebaseToken, verifyRoleAndToken('Student'), asyncHandler(getMyApplications));

/**
 * Moderator/Admin route - Get all applications
 */
router.get('/all', verifyFirebaseToken, verifyModerator, asyncHandler(getAllApplications));

/**
 * THEN LESS SPECIFIC ROUTES
 */

/**
 * Student routes - Create and delete own applications
 */
router.post('/', verifyFirebaseToken, verifyRoleAndToken('Student'), asyncHandler(createApplication));
router.delete('/:id', verifyFirebaseToken, verifyRoleAndToken('Student'), asyncHandler(deleteApplication));

/**
 * Moderator/Admin routes - Update application status
 */
router.patch('/:id', verifyFirebaseToken, verifyModerator, asyncHandler(updateApplicationStatus));

/**
 * Moderator/Admin routes - Update feedback
 */
router.patch('/:id/feedback', verifyFirebaseToken, verifyModerator, asyncHandler(updateApplicationFeedback));

/**
 * Admin only - Update payment status
 */
router.patch('/:id/payment', verifyFirebaseToken, verifyAdmin, asyncHandler(updatePaymentStatus));

/**
 * Get application by ID (must come before GET /)
 */
router.get('/:id', asyncHandler(getApplicationById));

/**
 * Get applications with optional email filter
 * Handles: GET /applications and GET /applications?email=xxx
 */
router.get('/', asyncHandler(getAllApplications));

module.exports = router;
