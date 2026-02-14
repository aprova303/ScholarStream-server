const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

let stripe;
try {
  stripe = require('stripe')(process.env.STRIPE_SECRET);
  console.log('Stripe initialized');
} catch (error) {
  console.warn(' Stripe initialization warning:', error.message);
}

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Initialize Firebase Admin - let firebase.js handle the configuration
const { initializeFirebase, isInitialized, getError } = require('./config/firebase');

try {
  const firebaseInitSuccess = initializeFirebase();
  if (!firebaseInitSuccess) {
    console.warn('  Firebase initialization warning:', getError());
  } else {
    console.log(' Firebase Admin initialized successfully');
  }
} catch (error) {
  console.warn(' Firebase initialization error:', error.message);
}



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
const paymentRoutes = require('./routes/paymentRoutes');
const { verifyFirebaseToken, verifyAdmin } = require('./config/auth');

async function run() {
  try {
    // Try to connect to MongoDB but don't exit if it fails
    try {
      await mongoose.connect(uri, clientOptions);
      console.log(' MongoDB connected successfully');
    } catch (mongoError) {
      console.warn('  MongoDB connection warning:', mongoError.message);
      console.warn(' Server will start but database operations will fail');
    }

    // Routes
    app.use('/users', userRoutes);
    app.use('/scholarships', scholarshipRoutes);
    app.use('/applications', applicationRoutes);
    app.use('/reviews', reviewRoutes);
    app.use('/role-requests', roleRequestRoutes);
    app.use('/payment', paymentRoutes);

    // Test route
    app.post('/test', (req, res) => {
      res.json({ message: 'Test route works' });
    });

    // Status endpoint
    app.get('/status', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        mongoConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        firebase: require('./config/firebase').isInitialized() ? 'initialized' : 'not initialized'
      });
    });

    // Health Check Route
    app.get('/', (req, res) => {
      res.send('ScholarStream server is running');
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
      console.log(`\n ScholarStream server is running on port ${port}`);
      // console.log(` Health Check: http://localhost:${port}/`);
      // console.log(` Status: http://localhost:${port}/status`);
      // console.log(` Test Route: POST http://localhost:${port}/test\n`);
    });

  } catch (error) {
    console.error(' Fatal error during server startup:', error.message);
    console.error('Stack:', error.stack);
    // Log the error but don't exit - let Vercel handle the function lifecycle
    // process.exit(1); 
  }
}

run().catch(console.error);

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await mongoose.disconnect();
  process.exit(0);
});