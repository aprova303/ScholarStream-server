const RoleRequest = require('../models/RoleRequest');
const User = require('../models/User');

/**
 * Create a role request (Student requests to be Moderator or Admin)
 */
const createRoleRequest = async (req, res) => {
  try {
    const { requestedRole, message } = req.body;
    const userEmail = req.user.email;

    // Validate input
    if (!['Moderator', 'Admin'].includes(requestedRole)) {
      return res.status(400).json({ error: 'Invalid role requested' });
    }

    // Get user details
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent Admins and Moderators from requesting roles
    if (user.role === 'Admin' || user.role === 'Moderator') {
      return res.status(400).json({ 
        error: 'You already have an elevated role. Only Students can request roles.' 
      });
    }

    // Check if user already has a pending request
    const existingRequest = await RoleRequest.findOne({
      userId: user._id,
      status: 'Pending'
    });

    if (existingRequest) {
      return res.status(400).json({ 
        error: 'You already have a pending role request. Please wait for admin review.' 
      });
    }

    // Create new role request
    const newRequest = new RoleRequest({
      userId: user._id,
      email: userEmail,
      userName: user.name,
      requestedRole,
      message: message || ''
    });

    const savedRequest = await newRequest.save();

    res.status(201).json({
      success: true,
      message: 'Role request submitted successfully',
      request: savedRequest
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all pending role requests (Admin only)
 */
const getPendingRequests = async (req, res) => {
  try {
    const requests = await RoleRequest.find({ status: 'Pending' })
      .populate('userId', 'name email photoURL')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all role requests with history (Admin only)
 */
const getAllRequests = async (req, res) => {
  try {
    const requests = await RoleRequest.find()
      .populate('userId', 'name email photoURL')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user's role requests (Student/all users)
 */
const getUserRequests = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const requests = await RoleRequest.find({ userId: user._id })
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Approve a role request (Admin only)
 */
const approveRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminResponse } = req.body;
    const adminEmail = req.user.email;

    // Get the role request
    const roleRequest = await RoleRequest.findById(requestId);
    if (!roleRequest) {
      return res.status(404).json({ error: 'Role request not found' });
    }

    if (roleRequest.status !== 'Pending') {
      return res.status(400).json({ 
        error: 'This request has already been reviewed' 
      });
    }

    // Get admin user ID
    const adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    // Update the user's role
    const user = await User.findByIdAndUpdate(
      roleRequest.userId,
      { role: roleRequest.requestedRole },
      { new: true }
    );

    // Update role request status
    roleRequest.status = 'Approved';
    roleRequest.reviewedBy = adminUser._id;
    roleRequest.adminResponse = adminResponse || `Approved to ${roleRequest.requestedRole}`;
    roleRequest.reviewedAt = new Date();

    await roleRequest.save();

    res.json({
      success: true,
      message: `User promoted to ${roleRequest.requestedRole}`,
      user,
      request: roleRequest
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Reject a role request (Admin only)
 */
const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminResponse } = req.body;
    const adminEmail = req.user.email;

    // Get the role request
    const roleRequest = await RoleRequest.findById(requestId);
    if (!roleRequest) {
      return res.status(404).json({ error: 'Role request not found' });
    }

    if (roleRequest.status !== 'Pending') {
      return res.status(400).json({ 
        error: 'This request has already been reviewed' 
      });
    }

    // Get admin user ID
    const adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    // Update role request status
    roleRequest.status = 'Rejected';
    roleRequest.reviewedBy = adminUser._id;
    roleRequest.adminResponse = adminResponse || 'Request rejected by admin';
    roleRequest.reviewedAt = new Date();

    await roleRequest.save();

    res.json({
      success: true,
      message: 'Role request rejected',
      request: roleRequest
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createRoleRequest,
  getPendingRequests,
  getAllRequests,
  getUserRequests,
  approveRequest,
  rejectRequest
};
