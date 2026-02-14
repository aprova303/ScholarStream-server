const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  scholarshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship',
    required: true
  },
  userId: {
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
  universityName: {
    type: String,
    required: true
  },
  scholarshipCategory: {
    type: String,
    enum: ['Full Fund', 'Partial', 'Self-fund'],
    required: true
  },
  degree: {
    type: String,
    enum: ['Diploma', 'Bachelor', 'Masters'],
    required: true
  },
  applicationFees: {
    type: Number,
    required: true
  },
  serviceCharge: {
    type: Number,
    required: true
  },
  applicationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  },
  transactionId: {
    type: String,
    default: null
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  feedback: {
    type: String,
    default: null
  },
  feedbackDate: {
    type: Date,
    default: null
  },
  // createdAt: {
  //   type: Date,
  //   default: Date.now
  // },
  // updatedAt: {
  //   type: Date,
  //   default: Date.now
  // }
  createdAt: {
  type: Date,
  default: () => new Date()
},
updatedAt: {
  type: Date,
  default: () => new Date()
}

}, { collection: 'applications' });

// applicationSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

applicationSchema.pre('save', function () {
  this.updatedAt = new Date();
});


module.exports = mongoose.model('Application', applicationSchema);
