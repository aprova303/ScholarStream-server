// Scholarship Controller
const Scholarship = require('../models/Scholarship');

/**
 * Get all scholarships with search, filter, sort, and pagination
 * Query parameters:
 * - search: Search term (scholarshipName, universityName, degree)
 * - category: Filter by scholarshipCategory
 * - country: Filter by universityCountry
 * - sortBy: Sort field (postDate, applicationFees) - default: postDate
 * - sortOrder: Sort order (asc, desc) - default: desc
 * - page: Page number (1-indexed) - default: 1
 * - limit: Items per page - default: 12
 */
const getAllScholarships = async (req, res) => {
  try {
    const {
      search = '',
      category = '',
      country = '',
      sortBy = 'postDate',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    // Build filter object
    const filter = {};

    // Search filter - searches by name, university, or degree
    if (search) {
      filter.$or = [
        { scholarshipName: { $regex: search, $options: 'i' } },
        { universityName: { $regex: search, $options: 'i' } },
        { degree: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      filter.scholarshipCategory = category;
    }

    // Country filter
    if (country) {
      filter.universityCountry = country;
    }

    // Determine sort field and order
    let sortField = 'scholarshipPostDate';
    if (sortBy === 'applicationFees') {
      sortField = 'applicationFees';
    }

    const sortOrderNum = sortOrder === 'asc' ? 1 : -1;
    const sortObject = { [sortField]: sortOrderNum };

    // Calculate pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const total = await Scholarship.countDocuments(filter);

    // Fetch scholarships with filters, sort, and pagination
    const scholarships = await Scholarship.find(filter)
      .sort(sortObject)
      .skip(skip)
      .limit(limitNum);

    // Send response with pagination metadata
    res.json({
      success: true,
      data: scholarships,
      pagination: {
        current: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
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
    console.log('[createScholarship] START', {
      userEmail: req.user?.email,
      userRole: req.userRole,
      bodyKeys: Object.keys(req.body),
    });

    if (!req.user || !req.user.email) {
      console.error('[createScholarship] Missing authentication');
      return res.status(401).json({
        error: 'User not authenticated',
      });
    }

    const scholarshipData = {
      ...req.body,
      postedUserEmail: req.user.email
    };

    const scholarship = new Scholarship(scholarshipData);
    await scholarship.save();

    console.log('[createScholarship] SUCCESS', { scholarshipId: scholarship._id });

    res.status(201).json({ 
      success: true, 
      message: 'Scholarship created successfully',
      scholarship 
    });
  } catch (error) {
    console.error('[createScholarship] ERROR', {
      message: error.message,
      code: error.code,
      name: error.name,
    });
    return res.status(500).json({ 
      error: 'Failed to create scholarship: ' + error.message,
      errorType: error.name
    });
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
