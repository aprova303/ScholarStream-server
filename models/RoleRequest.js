const mongoose = require('mongoose');

const roleRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  userName: {
    type: String,
    required: true
  },
  requestedRole: {
    type: String,
    enum: ['Moderator', 'Admin'],
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  adminResponse: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Index to prevent duplicate pending requests
roleRequestSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('RoleRequest', roleRequestSchema);
