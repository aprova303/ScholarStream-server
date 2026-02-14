// Firebase Admin Configuration
// Make sure to set FIREBASE_SERVICE_ACCOUNT environment variable with JSON string

const admin = require('firebase-admin');

let firebaseInitialized = false;
let firebaseError = null;

const initializeFirebase = () => {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      firebaseInitialized = true;
      return true;
    }

    // Get Firebase service account - support both JSON string and base64 encoded
    let serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (!serviceAccountJson) {
      firebaseError = 'FIREBASE_SERVICE_ACCOUNT environment variable is not set';
      console.error('🔴 Firebase Error:', firebaseError);
      return false;
    }

    // Parse the service account JSON
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch (parseError) {
      firebaseError = `Invalid JSON in FIREBASE_SERVICE_ACCOUNT: ${parseError.message}`;
      console.error('🔴 Firebase Parse Error:', firebaseError);
      return false;
    }

    // Validate required fields
    if (!serviceAccount.project_id || !serviceAccount.private_key) {
      firebaseError = 'FIREBASE_SERVICE_ACCOUNT missing required fields (project_id, private_key)';
      console.error('🔴 Firebase Validation Error:', firebaseError);
      return false;
    }

    // Initialize Firebase Admin
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      firebaseInitialized = true;
      console.log('✅ Firebase Admin SDK initialized successfully');
      return true;
    } catch (adminError) {
      firebaseError = `Failed to initialize Firebase Admin: ${adminError.message}`;
      console.error('🔴 Firebase Admin Init Error:', firebaseError);
      return false;
    }
  } catch (error) {
    firebaseError = `Unexpected error initializing Firebase: ${error.message}`;
    console.error('🔴 Firebase Unexpected Error:', firebaseError, error.stack);
    return false;
  }
};

// Lazy getter for auth to ensure Firebase is initialized first
const getAuth = () => {
  if (!firebaseInitialized) {
    throw new Error(`Firebase Admin not initialized. Details: ${firebaseError || 'Unknown error'}`);
  }
  if (!admin.apps.length) {
    throw new Error('Firebase Admin app not found');
  }
  return admin.auth();
};

module.exports = {
  initializeFirebase,
  getAuth,
  admin,
  isInitialized: () => firebaseInitialized,
  getError: () => firebaseError
};
