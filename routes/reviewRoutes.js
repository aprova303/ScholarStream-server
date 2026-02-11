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
router.post('/', verifyFirebaseToken, verifyRoleAndToken('Student'), createReview);
router.get('/my-reviews', verifyFirebaseToken, verifyRoleAndToken('Student'), getMyReviews);
router.patch('/:id', verifyFirebaseToken, verifyRoleAndToken('Student'), updateReview);
router.delete('/:id', verifyFirebaseToken, verifyRoleAndToken('Student'), deleteReview);

module.exports = router;
