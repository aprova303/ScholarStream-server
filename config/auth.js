// Middleware wrapper for async error handling
const asyncMiddleware = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    if (typeof next === 'function') {
      next(err);
    } else {
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  });
};

// Middleware to verify Firebase token and check user role
const { getAuth, isInitialized } = require('./firebase');
const User = require('../models/User');

/**
 * Middleware to verify Firebase token
 * Attaches decoded user data to req.user and user role to req.userRole
 * This is a comprehensive wrapper that fetches the user role from DB
 * Note: Does NOT require user to exist in database (role will be undefined)
 */
const verifyFirebaseToken = asyncMiddleware(async (req, res, next) => {
  try {
    console.log('verifyFirebaseToken called', { nextType: typeof next });
    // Check if Firebase is initialized
    if (!isInitialized()) {
      return res.status(503).json({ 
        error: 'Firebase authentication is not configured. Please set up FIREBASE_SERVICE_ACCOUNT environment variable.' 
      });
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const userEmail = decodedToken.email;

    // Fetch user from database to get role (optional - user might not exist during registration)
    const user = await User.findOne({ email: userEmail });

    // Attach token data to request
    req.user = decodedToken;
    req.userRole = user?.role || null;  // Will be null if user doesn't exist yet
    req.userId = user?._id || null;
    console.log('Token verified, about to call next', { userRole: req.userRole, nextType: typeof next });
    next();  // Call without return - let async function complete naturally
  } catch (error) {
    console.error('verifyFirebaseToken error:', error.message, error.stack);
    return res.status(401).json({ error: 'Invalid or expired token', details: error.message });
  }
});

/**
 * Factory function to verify specific role
 * MUST be used AFTER verifyFirebaseToken
 * Usage: router.get('/path', verifyFirebaseToken, verifyRoleAndToken('Student'), handler)
 */
const verifyRoleAndToken = (requiredRole) => {
  return (req, res, next) => {
    // User should exist by this point when accessing role-protected routes
    if (!req.userRole) {
      return res.status(403).json({ error: 'Access denied. User role required.' });
    }

    // Check if role matches required role(s)
    if (requiredRole !== 'all') {
      if (Array.isArray(requiredRole)) {
        if (!requiredRole.includes(req.userRole)) {
          return res.status(403).json({ 
            error: `Access denied. Required role: ${requiredRole.join(' or ')}` 
          });
        }
      } else {
        if (req.userRole !== requiredRole) {
          return res.status(403).json({ 
            error: `Access denied. Required role: ${requiredRole}` 
          });
        }
      }
    }

    next();  // Call without return
  };
};

/**
 * Middleware to verify Admin role
 * MUST be used AFTER verifyFirebaseToken
 * Checks if req.userRole === 'Admin' (token already verified)
 */
const verifyAdmin = (req, res, next) => {
  try {
    console.log('[verifyAdmin] CALLED', {
      userEmail: req.user?.email,
      userRole: req.userRole,
      hasNext: typeof next === 'function',
      isAdmin: req.userRole === 'Admin',
    });

    // User should exist by this point when accessing admin routes
    if (!req.userRole || req.userRole !== 'Admin') {
      console.log('[verifyAdmin] ACCESS DENIED - role mismatch', { received: req.userRole, expected: 'Admin' });
      return res.status(403).json({ 
        error: 'Access denied. Admin role required.',
        userRole: req.userRole
      });
    }

    console.log('[verifyAdmin] ACCESS GRANTED - calling next()');
    next();  // Call without return
  } catch (err) {
    console.error('[verifyAdmin] ERROR', { message: err.message, stack: err.stack });
    return res.status(500).json({ error: 'Error in admin verification: ' + err.message });
  }
};

/**
 * Middleware to verify Moderator role
 * MUST be used AFTER verifyFirebaseToken
 * Allows both Moderators and Admins (token already verified)
 */
const verifyModerator = (req, res, next) => {
  // User should exist by this point when accessing moderator routes
  if (!req.userRole || (req.userRole !== 'Moderator' && req.userRole !== 'Admin')) {
    return res.status(403).json({ 
      error: 'Access denied. Moderator or Admin role required.' 
    });
  }

  next();  // Call without return
};

module.exports = {
  verifyFirebaseToken,
  verifyRoleAndToken,
  verifyAdmin,
  verifyModerator
};
