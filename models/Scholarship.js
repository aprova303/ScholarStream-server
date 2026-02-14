const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  scholarshipName: {
    type: String,
    required: true
  },
  universityName: {
    type: String,
    required: true
  },
  universityImage: {
    type: String,
    required: true
  },
  universityCountry: {
    type: String,
    required: true
  },
  universityCity: {
    type: String,
    required: true
  },
  universityWorldRank: {
    type: Number,
    required: true
  },
  subjectCategory: {
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
  tuitionFees: {
    type: Number,
    default: null
  },
  applicationFees: {
    type: Number,
    required: true
  },
  serviceCharge: {
    type: Number,
    required: true
  },
  applicationDeadline: {
    type: Date,
    required: true
  },
  scholarshipPostDate: {
    type: Date,
    default: Date.now
  },
  postedUserEmail: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: null
  },
  requirements: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
//   createdAt: {
//   type: Date,
//   default: () => new Date()
// },
// updatedAt: {
//   type: Date,
//   default: () => new Date()
// }

}, { collection: 'scholarships',});

scholarshipSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
});

// scholarshipSchema.pre('save', function () {
//   this.updatedAt = new Date();
// });


module.exports = mongoose.model('Scholarship', scholarshipSchema);
