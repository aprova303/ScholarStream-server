const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  scholarshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship',
    required: true
  },
  universityName: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  userImage: {
    type: String,
    default: null
  },
  ratingPoint: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  reviewComment: {
    type: String,
    required: true
  },
  reviewDate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { collection: 'reviews' });

reviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Review', reviewSchema);
