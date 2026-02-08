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

async function run() {
  try {
    // Connect to MongoDB
    await mongoose.connect(uri, clientOptions);
    console.log("Successfully connected to MongoDB!");

    // Test the connection
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Routes
    app.use('/users', userRoutes);
    app.use('/scholarships', scholarshipRoutes);
    app.use('/applications', applicationRoutes);
    app.use('/reviews', reviewRoutes);

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
        console.error('Error creating checkout session:', error.message);
        res.status(500).json({ error: error.message });
      }
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Server error:', err);
      res.status(500).json({ error: 'Internal server error' });
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