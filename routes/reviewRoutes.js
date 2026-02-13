// Review Routes
const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const {
  createReview,
  getAllReviews,
  getReviewsByScholarship,
  getMyReviews,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { verifyFirebaseToken, verifyRoleAndToken } = require('../config/auth');

/**
 * Student routes - Create review
 */
router.post('/', verifyFirebaseToken, verifyRoleAndToken('Student'), asyncHandler(createReview));

/**
 * Public routes - Get reviews by scholarship
 */
router.get('/scholarship/:scholarshipId', asyncHandler(getReviewsByScholarship));

/**
 * Student routes - Update own review
 */
router.patch('/:id', verifyFirebaseToken, verifyRoleAndToken('Student'), asyncHandler(updateReview));

/**
 * Student routes - Delete own review (and Moderator can delete any)
 */
router.delete('/:id', verifyFirebaseToken, asyncHandler(deleteReview));

/**
 * Public routes - Get all reviews (supports ?email=xxx query parameter)
 * This goes LAST to avoid shadowing other routes
 */
router.get('/', asyncHandler(getAllReviews));

module.exports = router;
