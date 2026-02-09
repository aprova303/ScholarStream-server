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
const { verifyAdmin } = require('../config/auth');

/**
 * Public routes
 */
router.get('/', getAllScholarships);
router.get('/:id', getScholarshipById);
router.get('/category/:category', getScholarshipsByCategory);

/**
 * Admin only routes
 */
router.post('/', verifyAdmin, createScholarship);
router.patch('/:id', verifyAdmin, updateScholarship);
router.delete('/:id', verifyAdmin, deleteScholarship);

module.exports = router;
