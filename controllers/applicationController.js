// Application Controller
const Application = require('../models/Application');
const Scholarship = require('../models/Scholarship');

/**
 * Create application (Student only)
 */
const createApplication = async (req, res) => {
  try {
    const { scholarshipId, ...applicationData } = req.body;

    // Verify scholarship exists
    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }

    // Check if student already applied
    const existingApp = await Application.findOne({
      scholarshipId,
      userEmail: req.user.email
    });

    if (existingApp) {
      return res.status(400).json({ error: 'You have already applied for this scholarship' });
    }

    const application = new Application({
      scholarshipId,
      userEmail: req.user.email,
      ...applicationData,
      applicationStatus: 'pending',
      paymentStatus: 'unpaid'
    });

    await application.save();

    res.status(201).json({ 
      success: true, 
      message: 'Application submitted successfully',
      application 
    });
  } catch (error) {
    console.error('Error creating application:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get applications by user email (Student)
 */
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ 
      userEmail: req.user.email 
    }).populate('scholarshipId');

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all applications (Moderator/Admin)
 */
const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('scholarshipId')
      .sort({ applicationDate: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get application by ID
 */
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id).populate('scholarshipId');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update application status (Moderator/Admin)
 */
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { applicationStatus, feedback } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(applicationStatus)) {
      return res.status(400).json({ error: 'Invalid application status' });
    }

    const application = await Application.findByIdAndUpdate(
      id,
      { 
        applicationStatus, 
        feedback: feedback || null,
        feedbackDate: feedback ? new Date() : null
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ 
      success: true, 
      message: 'Application status updated successfully',
      application 
    });
  } catch (error) {
    console.error('Error updating application:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update payment status (Admin)
 */
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!['unpaid', 'paid'].includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    const application = await Application.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ 
      success: true, 
      message: 'Payment status updated successfully',
      application 
    });
  } catch (error) {
    console.error('Error updating payment status:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete application (Student - only if pending)
 */
const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.applicationStatus !== 'pending') {
      return res.status(400).json({ error: 'Cannot delete reviewed applications' });
    }

    await Application.findByIdAndDelete(id);

    res.json({ 
      success: true, 
      message: 'Application deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting application:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createApplication,
  getMyApplications,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  updatePaymentStatus,
  deleteApplication
};
