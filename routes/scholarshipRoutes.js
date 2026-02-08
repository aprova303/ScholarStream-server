// Scholarship Routes
const express = require('express');
const router = express.Router();
const {
  getAllScholarships,
  getScholarshipById,
  createScholarship,
  updateScholarship,
  deleteScholarship,
  getScholarshipsByCategory
} = require('../controllers/scholarshipController');
const { verifyFirebaseToken, verifyRoleAndToken } = require('../config/auth');

/**
 * Public routes
 */
router.get('/', getAllScholarships);
router.get('/:id', getScholarshipById);
router.get('/category/:category', getScholarshipsByCategory);

/**
 * Admin only routes
 */
router.post('/', verifyRoleAndToken('Admin'), createScholarship);
router.patch('/:id', verifyRoleAndToken('Admin'), updateScholarship);
router.delete('/:id', verifyRoleAndToken('Admin'), deleteScholarship);

module.exports = router;
