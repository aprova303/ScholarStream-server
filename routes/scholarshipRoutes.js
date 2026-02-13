// Scholarship Routes
const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const {
  getAllScholarships,
  getScholarshipById,
  createScholarship,
  updateScholarship,
  deleteScholarship,
  getScholarshipsByCategory
} = require('../controllers/scholarshipController');
const { verifyFirebaseToken, verifyAdmin } = require('../config/auth');

/**
 * Public routes
 */
// More specific routes first to prevent shadowing
router.get('/category/:category', asyncHandler(getScholarshipsByCategory));
router.get('/:id', asyncHandler(getScholarshipById));
router.get('/', asyncHandler(getAllScholarships));

/**
 * Admin only routes - Use middleware chain: verify token first, then check admin role
 */
router.post('/', verifyFirebaseToken, verifyAdmin, asyncHandler(createScholarship));
router.patch('/:id', verifyFirebaseToken, verifyAdmin, asyncHandler(updateScholarship));
router.delete('/:id', verifyFirebaseToken, verifyAdmin, asyncHandler(deleteScholarship));

module.exports = router;
