// User Controller
const User = require('../models/User');

/**
 * Create or Update a user in the database
 * Called when user registers or logs in
 */
const createOrUpdateUser = async (req, res) => {
  try {
    console.log('[createOrUpdateUser] Called', {
      bodyKeys: Object.keys(req.body),
      hasUser: !!req.user,
      userEmail: req.user?.email,
      incomingEmail: req.body.email,
    });

    const { email, name, photoURL, firebaseUid } = req.body;

    // Validate input
    if (!email || !firebaseUid) {
      console.log('[createOrUpdateUser] Missing required fields:', {
        email,
        firebaseUid,
      });
      return res.status(400).json({ 
        error: 'Email and firebaseUid are required',
        received: { email, firebaseUid }
      });
    }

    const normalizedEmail = email.toLowerCase();
    
    // Find existing user by email OR firebaseUid
    let user = await User.findOne({ 
      $or: [
        { email: normalizedEmail },
        { firebaseUid }
      ]
    });

    if (user) {
      // Update existing user
      console.log('[createOrUpdateUser] Updating existing user:', { email: normalizedEmail });
      user.email = normalizedEmail;  // Ensure email is correct
      user.firebaseUid = firebaseUid;  // Ensure firebaseUid is correct
      if (name) user.name = name;
      if (photoURL) user.photoURL = photoURL;
      user.updatedAt = new Date();
      
      const updatedUser = await user.save();
      
      return res.json({ 
        success: true, 
        message: 'User updated successfully',
        user: updatedUser
      });
    }

    // Create new user (default role: Student)
    console.log('[createOrUpdateUser] Creating new user:', { email: normalizedEmail, name });
    const newUser = new User({
      email: normalizedEmail,
      name: name || 'User',
      photoURL: photoURL || null,
      firebaseUid,
      role: 'Student'
    });

    const savedUser = await newUser.save();
    console.log('[createOrUpdateUser] User created successfully:', { userId: savedUser._id, email: savedUser.email });
    
    res.status(201).json({ 
      success: true, 
      message: 'User created successfully',
      user: savedUser
    });
  } catch (error) {
    console.error('[createOrUpdateUser] Error:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack.split('\n').slice(0, 5).join('\n'),
    });

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        error: `${field} already exists`,
        field: field
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ 
        error: 'Validation failed',
        validationErrors: messages
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to save user: ' + error.message,
      type: error.name
    });
  }
};

/**
 * Get user by email
 */
const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user role by email
 */
const getUserRole = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({ role: 'Student' }); // Default role
    }

    res.json({ role: user.role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all users (Admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-firebaseUid');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update user role (Admin only)
 */
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['Student', 'Moderator', 'Admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      success: true, 
      message: 'User role updated successfully',
      user 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get users by role (Admin only)
 */
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    if (!['Student', 'Moderator', 'Admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const users = await User.find({ role }).select('-firebaseUid');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete user (Admin only)
 */
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOrUpdateUser,
  getUserByEmail,
  getUserRole,
  getAllUsers,
  updateUserRole,
  getUsersByRole,
  deleteUser
};
