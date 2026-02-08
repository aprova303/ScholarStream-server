// Firebase Admin Configuration
// Make sure to set FIREBASE_SERVICE_ACCOUNT environment variable with JSON string

const admin = require('firebase-admin');

let firebaseInitialized = false;
let firebaseError = null;

const initializeFirebase = () => {
  try {
    // Check if Firebase service account is provided
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (!serviceAccountJson) {
      firebaseError = 'FIREBASE_SERVICE_ACCOUNT environment variable is not set';
    //   console.warn('⚠️  WARNING:', firebaseError);
    //   console.warn('   Firebase authentication will not work until this is configured');
    //   console.warn('   See QUICK_REFERENCE.md for setup instructions');
      return false;
    }

    // Parse the service account JSON
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch (parseError) {
      firebaseError = `Invalid JSON in FIREBASE_SERVICE_ACCOUNT: ${parseError.message}`;
      console.error(' ERROR:', firebaseError);
      console.error('   Make sure the JSON is valid and properly formatted');
      return false;
    }

    // Validate required fields
    if (!serviceAccount.project_id || !serviceAccount.private_key) {
      firebaseError = 'FIREBASE_SERVICE_ACCOUNT missing required fields (project_id, private_key)';
      console.error(' ERROR:', firebaseError);
      return false;
    }

    // Initialize Firebase Admin
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    
    firebaseInitialized = true;
    console.log(' Firebase Admin initialized successfully');
    return true;
  } catch (error) {
    firebaseError = `Unexpected error initializing Firebase: ${error.message}`;
    console.error(' ERROR:', firebaseError);
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
