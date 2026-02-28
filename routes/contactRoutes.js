const express = require('express');
const router = express.Router();
const {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
  getContactStats
} = require('../controllers/contactController');
const { verifyFirebaseToken, verifyAdmin } = require('../config/auth');

// Public route - Create a new contact
router.post('/', createContact);

// Admin routes - Get all contacts
router.get('/', verifyFirebaseToken, verifyAdmin, getAllContacts);

// Admin route - Get contact statistics
router.get('/stats', verifyFirebaseToken, verifyAdmin, getContactStats);

// Admin route - Get a single contact
router.get('/:id', verifyFirebaseToken, verifyAdmin, getContactById);

// Admin route - Update contact (add response/change status)
router.patch('/:id', verifyFirebaseToken, verifyAdmin, updateContact);

// Admin route - Delete contact
router.delete('/:id', verifyFirebaseToken, verifyAdmin, deleteContact);

module.exports = router;
