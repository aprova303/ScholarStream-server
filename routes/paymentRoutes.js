// Payment Routes
const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const {
  createCheckoutSession,
  confirmPayment,
  saveApplicationUnpaid
} = require('../controllers/paymentController');
const { verifyFirebaseToken, verifyRoleAndToken } = require('../config/auth');

/**
 * Create Stripe Checkout Session (Student only)
 */
router.post('/create-checkout', verifyFirebaseToken, verifyRoleAndToken('Student'), asyncHandler(createCheckoutSession));

/**
 * Confirm and save application after successful payment (Student only)
 */
router.post('/confirm-payment', verifyFirebaseToken, verifyRoleAndToken('Student'), asyncHandler(confirmPayment));

/**
 * Save application with unpaid status (Student only)
 */
router.post('/save-unpaid', verifyFirebaseToken, verifyRoleAndToken('Student'), asyncHandler(saveApplicationUnpaid));

module.exports = router;
