// Review Routes
const express = require('express');
const router = express.Router();
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
 * Public routes
 */
router.get('/', getAllReviews);
router.get('/scholarship/:scholarshipId', getReviewsByScholarship);

/**
 * Student routes
 */
router.post('/', verifyRoleAndToken('Student'), createReview);
router.get('/my-reviews', verifyRoleAndToken('Student'), getMyReviews);
router.patch('/:id', verifyRoleAndToken('Student'), updateReview);
router.delete('/:id', verifyRoleAndToken('Student'), deleteReview);

module.exports = router;
