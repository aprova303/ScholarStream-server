const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

/**
 * Bootstrap Script - Creates first admin user
 * 
 * Usage: 
 * FIREBASE_UID=test-admin-123 node server/bootstrap-admin.js
 * 
 * Or uses hardcoded values if env vars not provided
 */

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@scholarstream.com';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Platform Admin';
const FIREBASE_UID = process.env.FIREBASE_UID || 'bootstrap-admin-uid';

async function createBootstrapAdmin() {
  try {
    // Connect to MongoDB
    const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2zhcuwp.mongodb.net/ScholarStream?retryWrites=true&w=majority`;
    
    await mongoose.connect(uri, {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      },
    });

    console.log('✓ Connected to MongoDB\n');

    // Check if admin already exists
    const existing = await User.findOne({ email: ADMIN_EMAIL });
    
    if (existing) {
      console.log(' Admin already exists:');
      console.log(`   Email: ${existing.email}`);
      console.log(`   Role: ${existing.role}\n`);
      
      if (existing.role !== 'Admin') {
        await User.updateOne(
          { email: ADMIN_EMAIL },
          { role: 'Admin' }
        );
        console.log(' Updated role to Admin\n');
      }
      
      console.log(' No new admin created (already exists)\n');
      await mongoose.disconnect();
      return;
    }

    // Create new admin user
    const adminUser = new User({
      email: ADMIN_EMAIL.toLowerCase(),
      name: ADMIN_NAME,
      firebaseUid: FIREBASE_UID,
      role: 'Admin',
      photoURL: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await adminUser.save();

    console.log('1. Go to Firebase Console → Authentication → Users');
    console.log('2. Create user with email:', ADMIN_EMAIL);
    console.log('3. Set password (e.g., Admin@123)');
    console.log('4. Use same password to login\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error(' Error:', error.message);
    process.exit(1);
  }
}

createBootstrapAdmin();
