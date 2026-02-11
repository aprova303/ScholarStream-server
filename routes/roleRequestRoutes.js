const express = require('express');
const router = express.Router();
const {
  createRoleRequest,
  getPendingRequests,
  getAllRequests,
  getUserRequests,
  approveRequest,
  rejectRequest
} = require('../controllers/roleRequestController');

const { verifyFirebaseToken, verifyAdmin } = require('../config/auth');

// Student: Create a role request
router.post('/create', verifyFirebaseToken, createRoleRequest);

// Student: Get their own role requests
router.get('/my-requests', verifyFirebaseToken, getUserRequests);

// Admin: Get all pending requests
router.get('/pending', verifyFirebaseToken, verifyAdmin, getPendingRequests);

// Admin: Get all requests (with history)
router.get('/all', verifyFirebaseToken, verifyAdmin, getAllRequests);

// Admin: Approve a request
router.put('/approve/:requestId', verifyFirebaseToken, verifyAdmin, approveRequest);

// Admin: Reject a request
router.put('/reject/:requestId', verifyFirebaseToken, verifyAdmin, rejectRequest);

module.exports = router;
