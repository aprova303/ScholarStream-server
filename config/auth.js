// Middleware to verify Firebase token and check user role
const { getAuth, isInitialized } = require('./firebase');
const User = require('../models/User');

/**
 * Middleware to verify Firebase token
 * Attaches decoded user data to req.user and user role to req.userRole
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    if (!isInitialized()) {
      return res.status(503).json({
        error: 'Firebase authentication not configured'
      });
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);

    const user = await User.findOne({ email: decodedToken.email });

    req.user = decodedToken;
    req.userRole = user?.role || null;
    req.userId = user?._id || null;

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid or expired token',
      details: error.message
    });
  }
};

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
    next();  
  } catch (err) {
    console.error('[verifyAdmin] ERROR', { message: err.message, stack: err.stack });
    return res.status(500).json({ error: 'Error in admin verification: ' + err.message });
  }
};

const verifyModerator = (req, res, next) => {
  // User should exist by this point when accessing moderator routes
  if (!req.userRole || (req.userRole !== 'Moderator' && req.userRole !== 'Admin')) {
    return res.status(403).json({ 
      error: 'Access denied. Moderator or Admin role required.' 
    });
  }

  next();  
};

module.exports = {
  verifyFirebaseToken,
  verifyRoleAndToken,
  verifyAdmin,
  verifyModerator
};
