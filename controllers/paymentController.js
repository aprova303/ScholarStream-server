// Payment Controller
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const Application = require('../models/Application');
const Scholarship = require('../models/Scholarship');

/**
 * Create Stripe Checkout Session
 */
const createCheckoutSession = async (req, res) => {
  try {
    const { scholarshipId, applicationData } = req.body;

    // Verify scholarship exists
    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }

    const totalAmount = (scholarship.applicationFees + (applicationData?.serviceCharge || 0));
    const siteDomain = process.env.SITE_DOMAIN || 'http://localhost:5173';
    console.log('[Payment Controller] Creating session for:', {
      scholarshipId,
      totalAmount,
      siteDomain,
      hasStripeSecret: !!process.env.STRIPE_SECRET
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${scholarship.scholarshipName} Application`,
              description: `${scholarship.universityName} - Application Fee`,
              images: [scholarship.universityImage],
            },
            unit_amount: Math.round(totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${siteDomain}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteDomain}/payment-cancel?scholarship_id=${scholarshipId}`,
      metadata: {
        scholarshipId,
        userId: req.user.uid,
        userEmail: req.user.email,
        applicationFees: scholarship.applicationFees,
        serviceCharge: applicationData?.serviceCharge || 0,
      },
      customer_email: req.user.email,
    });

    console.log('[Payment Controller] Session created successfully:', {
      sessionId: session.id,
      paymentStatus: session.payment_status,
      clientSecret: session.client_secret ? 'present' : 'missing'
    });
    
    res.json({ 
      success: true, 
      sessionId: session.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY 
    });
  } catch (error) {
    console.error('[Payment Controller] Error creating checkout session:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
      param: error.param
    });
    res.status(500).json({ 
      error: error.message, 
      type: error.type,
      details: 'Check server logs for details'
    });
  }
};

/**
 * Verify and Save Application After Successful Payment
 */
const confirmPayment = async (req, res) => {
  try {

    const { sessionId, applicationData } = req.body;

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ 
        success: false, 
        error: 'Payment not completed' 
      });
    }

    // Check if application already exists
    const existingApp = await Application.findOne({
      scholarshipId: session.metadata.scholarshipId,
      userEmail: session.customer_email
    });

    if (existingApp && existingApp.paymentStatus === 'paid') {
      return res.status(400).json({ 
        success: false, 
        error: 'You have already paid for this scholarship application' 
      });
    }

    let application;

    if (existingApp) {
      // Update existing unpaid application
      application = await Application.findByIdAndUpdate(
        existingApp._id,
        {
          ...applicationData,
          paymentStatus: 'paid',
          transactionId: session.payment_intent,
          updatedAt: new Date()
        },
        { new: true }
      );
    } else {
      // Create new application
      application = new Application({
        scholarshipId: session.metadata.scholarshipId,
        userId: req.user.uid,
        userEmail: req.user.email,
        ...applicationData,
        applicationStatus: 'pending',
        paymentStatus: 'paid',
        transactionId: session.payment_intent,
        applicationDate: new Date()
      });

      await application.save();
    }

    res.json({
      success: true,
      message: 'Payment verified and application saved successfully',
      application,
      transactionId: session.payment_intent,
      paymentStatus: session.payment_status,
      amountPaid: session.amount_total / 100, // Convert from cents to dollars
      currency: session.currency
    });
  } catch (error) {
    console.error('Error confirming payment:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Save Application for Unpaid Status (when user cancels)
 */
const saveApplicationUnpaid = async (req, res) => {
  try {
    const { scholarshipId, applicationData } = req.body;

    // Verify scholarship exists
    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }

    // Check if student already applied
    const existingApp = await Application.findOne({
      scholarshipId,
      userEmail: req.user.email
    });

    if (existingApp) {
      // Update existing application with new data but keep the same paymentStatus
      const application = await Application.findByIdAndUpdate(
        existingApp._id,
        {
          ...applicationData,
          updatedAt: new Date()
        },
        { new: true }
      );

      return res.status(201).json({
        success: true,
        message: 'Application saved. Please complete payment to submit.',
        application
      });
    }

    // Create new unpaid application
    const application = new Application({
      scholarshipId,
      userId: req.user.uid,
      userEmail: req.user.email,
      ...applicationData,
      applicationStatus: 'pending',
      paymentStatus: 'unpaid',
      applicationDate: new Date()
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: 'Application saved. Please complete payment to submit.',
      application
    });
  } catch (error) {
    console.error('Error saving unpaid application:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCheckoutSession,
  confirmPayment,
  saveApplicationUnpaid
};
