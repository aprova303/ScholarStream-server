/**
 * OPTIONAL: One-time script to create admin user in MongoDB
 * For deployment, you can manually create the admin in MongoDB instead
 * 
 * Usage: node seed-admin.js
 * 
 * But the SIMPLER method is:
 * 1. Go to MongoDB Atlas → ScholarStream → users
 * 2. Insert manually with Admin role
 * 3. Create same user in Firebase Console
 * 4. Done! Just share email/password with admin
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const ADMIN_EMAIL = 'admin@scholarstream.com';
const ADMIN_PASSWORD = 'admin@123456';
const ADMIN_UID = 'admin-seed-uid-' + Date.now();

async function createAdmin() {
  try {
    const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2zhcuwp.mongodb.net/ScholarStream?retryWrites=true&w=majority`;
    
    await mongoose.connect(uri, {
      serverApi: { version: '1', strict: true, deprecationErrors: true }
    });

    console.log('✓ Connected to MongoDB\n');

    // Check if admin exists
    const existing = await User.findOne({ email: ADMIN_EMAIL });
    
    if (existing) {
      console.log('⚠️  Admin already exists:');
      console.log(`   Email: ${existing.email}`);
      console.log(`   Role: ${existing.role}\n`);
      
      // Offer to update role
      if (existing.role !== 'Admin') {
        existing.role = 'Admin';
        await existing.save();
        console.log('✅ Updated role to Admin\n');
      }
      
      await mongoose.disconnect();
      return;
    }

    // Create new admin
    const admin = new User({
      email: ADMIN_EMAIL,
      name: 'Admin',
      photoURL: null,
      firebaseUid: ADMIN_UID,
      role: 'Admin'
    });

    const saved = await admin.save();
    
    console.log('✅ Admin created successfully!\n');
    console.log('📧 Email: ' + ADMIN_EMAIL);
    console.log('🔑 Password: ' + ADMIN_PASSWORD);
    console.log('\n⚡ NEXT STEP:');
    console.log('Go to Firebase Console → Authentication → Users');
    console.log('Add user with same email/password');
    console.log('\n✨ Then just share Email & Password with admin!\n');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createAdmin();
