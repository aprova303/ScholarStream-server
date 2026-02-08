// Middleware to verify Firebase token and check user role
const { getAuth, isInitialized } = require('./firebase');
const User = require('../models/User');

/**
 * Middleware to verify Firebase token
 * Attaches decoded user data to req.user
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    // Check if Firebase is initialized
    if (!isInitialized()) {
      return res.status(503).json({ 
        error: 'Firebase authentication is not configured. Please set up FIREBASE_SERVICE_ACCOUNT environment variable.' 
      });
    }

    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware to verify Firebase token and check user role
 * Requires role to be passed as parameter
 */
const verifyRoleAndToken = (requiredRole) => {
  return async (req, res, next) => {
    try {
      // Check if Firebase is initialized
      if (!isInitialized()) {
        return res.status(503).json({ 
          error: 'Firebase authentication is not configured. Please set up FIREBASE_SERVICE_ACCOUNT environment variable.' 
        });
      }

      const token = req.headers.authorization?.split('Bearer ')[1];

      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const auth = getAuth();
      const decodedToken = await auth.verifyIdToken(token);
      const userEmail = decodedToken.email;

      // Fetch user from database to check role
      const user = await User.findOne({ email: userEmail });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.role !== requiredRole && requiredRole !== 'all') {
        // Allow multiple roles - pass as array
        if (Array.isArray(requiredRole)) {
          if (!requiredRole.includes(user.role)) {
            return res.status(403).json({ 
              error: `Access denied. Required role: ${requiredRole.join(' or ')}` 
            });
          }
        } else {
          return res.status(403).json({ 
            error: `Access denied. Required role: ${requiredRole}` 
          });
        }
      }

      req.user = decodedToken;
      req.userRole = user.role;
      req.userId = user._id;
      next();
    } catch (error) {
      console.error('Role verification error:', error.message);
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
};

module.exports = {
  verifyFirebaseToken,
  verifyRoleAndToken
};
