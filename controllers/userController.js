// User Controller
const User = require('../models/User');

/**
 * Create or Update a user in the database
 * Called when user registers or logs in
 */
const createOrUpdateUser = async (req, res) => {
  try {
    const { email, name, photoURL, firebaseUid } = req.body;

    if (!email || !firebaseUid) {
      return res.status(400).json({ error: 'Email and firebaseUid are required' });
    }

    // Find existing user
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Update existing user
      if (name) user.name = name;
      if (photoURL) user.photoURL = photoURL;
      await user.save();
      return res.json({ 
        success: true, 
        message: 'User updated successfully',
        user 
      });
    }

    // Create new user (default role: Student)
    user = new User({
      email: email.toLowerCase(),
      name: name || 'User',
      photoURL: photoURL || null,
      firebaseUid,
      role: 'Student'
    });

    await user.save();
    res.status(201).json({ 
      success: true, 
      message: 'User created successfully',
      user 
    });
  } catch (error) {
    console.error('Error creating/updating user:', error.message);
    res.status(500).json({ error: error.message });
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
    console.error('Error fetching user:', error.message);
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
    console.error('Error fetching user role:', error.message);
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
    console.error('Error fetching users:', error.message);
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
    console.error('Error updating user role:', error.message);
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
    console.error('Error fetching users by role:', error.message);
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
    console.error('Error deleting user:', error.message);
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
