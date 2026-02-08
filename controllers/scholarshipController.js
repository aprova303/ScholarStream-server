// Scholarship Controller
const Scholarship = require('../models/Scholarship');

/**
 * Get all scholarships
 */
const getAllScholarships = async (req, res) => {
  try {
    const scholarships = await Scholarship.find().sort({ scholarshipPostDate: -1 });
    res.json(scholarships);
  } catch (error) {
    console.error('Error fetching scholarships:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get scholarship by ID
 */
const getScholarshipById = async (req, res) => {
  try {
    const { id } = req.params;
    const scholarship = await Scholarship.findById(id);

    if (!scholarship) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }

    res.json(scholarship);
  } catch (error) {
    console.error('Error fetching scholarship:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create scholarship (Admin only)
 */
const createScholarship = async (req, res) => {
  try {
    const scholarshipData = {
      ...req.body,
      postedUserEmail: req.user.email
    };

    const scholarship = new Scholarship(scholarshipData);
    await scholarship.save();

    res.status(201).json({ 
      success: true, 
      message: 'Scholarship created successfully',
      scholarship 
    });
  } catch (error) {
    console.error('Error creating scholarship:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update scholarship (Admin only)
 */
const updateScholarship = async (req, res) => {
  try {
    const { id } = req.params;
    
    const scholarship = await Scholarship.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!scholarship) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }

    res.json({ 
      success: true, 
      message: 'Scholarship updated successfully',
      scholarship 
    });
  } catch (error) {
    console.error('Error updating scholarship:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete scholarship (Admin only)
 */
const deleteScholarship = async (req, res) => {
  try {
    const { id } = req.params;

    const scholarship = await Scholarship.findByIdAndDelete(id);

    if (!scholarship) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }

    res.json({ 
      success: true, 
      message: 'Scholarship deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting scholarship:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get scholarships by category
 */
const getScholarshipsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const scholarships = await Scholarship.find({ 
      scholarshipCategory: category 
    }).sort({ scholarshipPostDate: -1 });

    res.json(scholarships);
  } catch (error) {
    console.error('Error fetching scholarships by category:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllScholarships,
  getScholarshipById,
  createScholarship,
  updateScholarship,
  deleteScholarship,
  getScholarshipsByCategory
};
