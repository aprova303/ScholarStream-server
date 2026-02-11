const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Initialize Firebase Admin
const { initializeFirebase } = require('./config/firebase');
initializeFirebase();

// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2zhcuwp.mongodb.net/ScholarStream?retryWrites=true&w=majority`;

const clientOptions = { 
  serverApi: { 
    version: '1', 
    strict: true, 
    deprecationErrors: true 
  } 
};

// Import routes
const userRoutes = require('./routes/userRoutes');
const scholarshipRoutes = require('./routes/scholarshipRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const roleRequestRoutes = require('./routes/roleRequestRoutes');
const { verifyFirebaseToken, verifyAdmin } = require('./config/auth');

async function run() {
  try {
    // Connect to MongoDB
    await mongoose.connect(uri, clientOptions);

    // Test the connection
    await mongoose.connection.db.admin().command({ ping: 1 });

    // Routes
    app.use('/users', userRoutes);
    app.use('/scholarships', scholarshipRoutes);
    app.use('/applications', applicationRoutes);
    app.use('/reviews', reviewRoutes);
    app.use('/role-requests', roleRequestRoutes);

    // Test route
    app.post('/test', (req, res) => {
      res.json({ message: 'Test route works' });
    });

    // Health Check Route
    app.get('/', (req, res) => {
      res.send('ScholarStream server is running');
    });

    // Payment related APIs (Basic structure - implement based on your needs)
    app.post('/create-checkout-session', async (req, res) => {
      try {
        const { applicationFees, serviceCharge, applicationId } = req.body;

        const session = await stripe.checkout.sessions.create({
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: 'Scholarship Application Fees',
                },
                unit_amount: Math.round((applicationFees + serviceCharge) * 100),
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${process.env.SITE_DOMAIN || 'http://localhost:5173'}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}&applicationId=${applicationId}`,
          cancel_url: `${process.env.SITE_DOMAIN || 'http://localhost:5173'}/dashboard/payment-cancel`,
        });

        res.json({ sessionId: session.id });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Analytics endpoint - Admin only
    app.get('/analytics', verifyFirebaseToken, verifyAdmin, async (req, res) => {
      try {
        const User = require('./models/User');
        const Application = require('./models/Application');
        const Scholarship = require('./models/Scholarship');

        // Get user counts by role
        const totalUsers = await User.countDocuments();
        const studentCount = await User.countDocuments({ role: 'Student' });
        const moderatorCount = await User.countDocuments({ role: 'Moderator' });
        const adminCount = await User.countDocuments({ role: 'Admin' });

        // Get application counts by status
        const pendingApplications = await Application.countDocuments({ status: 'Pending' });
        const processingApplications = await Application.countDocuments({ status: 'Processing' });
        const completedApplications = await Application.countDocuments({ status: 'Completed' });
        const rejectedApplications = await Application.countDocuments({ status: 'Rejected' });

        // Get scholarship count
        const scholarshipCount = await Scholarship.countDocuments();

        // Calculate total fees (application fees + service charge from applications)
        const applicationAggregation = await Application.aggregate([
          {
            $group: {
              _id: null,
              totalFees: {
                $sum: {
                  $add: ['$applicationFees', '$serviceCharge']
                }
              }
            }
          }
        ]);

        const totalFees = applicationAggregation.length > 0 ? applicationAggregation[0].totalFees : 0;

        res.json({
          totalUsers,
          studentCount,
          moderatorCount,
          adminCount,
          totalScholarships: scholarshipCount,
          pendingApplications,
          processingApplications,
          completedApplications,
          rejectedApplications,
          totalFees
        });
      } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Error handling middleware - catch async errors
    app.use((err, req, res, next) => {
      console.error('=== SERVER ERROR ===');
      console.error('Error Type:', err.constructor.name);
      console.error('Error Message:', err.message);
      console.error('Error Code:', err.code);
      console.error('Stack:', err.stack);
      console.error('===================');
      const status = err.status || err.statusCode || 500;
      res.status(status).json({ 
        error: err.message || 'Internal Server Error',
        errorType: err.constructor.name,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    });

    // Start server
    app.listen(port, () => {
      console.log(`ScholarStream server is running on port ${port}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

run().catch(console.error);

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await mongoose.disconnect();
  process.exit(0);
});