// Review Controller
const Review = require('../models/Review');
const Scholarship = require('../models/Scholarship');

/**
 * Create review (Student only)
 */
const createReview = async (req, res) => {
  try {
    const { scholarshipId, ...reviewData } = req.body;

    // Verify scholarship exists
    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }

    const review = new Review({
      scholarshipId,
      userEmail: req.user.email,
      ...reviewData
    });

    await review.save();

    res.status(201).json({ 
      success: true, 
      message: 'Review submitted successfully',
      review 
    });
  } catch (error) {
    console.error('Error creating review:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all reviews or filter by email
 */
const getAllReviews = async (req, res) => {
  try {
    const { email } = req.query;
    
    let query = {};
    if (email) {
      query.userEmail = email;
    }
    
    const reviews = await Review.find(query)
      .populate('scholarshipId', 'scholarshipName')
      .sort({ reviewDate: -1 });
    
    // Add scholarshipName to each review if populated
    const reviewsWithNames = reviews.map(review => {
      const reviewObj = review.toObject ? review.toObject() : review;
      if (review.scholarshipId && review.scholarshipId.scholarshipName) {
        reviewObj.scholarshipName = review.scholarshipId.scholarshipName;
      }
      return reviewObj;
    });
    
    res.json(reviewsWithNames);
  } catch (error) {
    console.error('Error fetching reviews:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get reviews by scholarship
 */
const getReviewsByScholarship = async (req, res) => {
  try {
    const { scholarshipId } = req.params;

    const reviews = await Review.find({ scholarshipId })
      .populate('scholarshipId', 'scholarshipName universityName')
      .sort({ reviewDate: -1 });
    
    const reviewsWithNames = reviews.map(review => {
      const reviewObj = review.toObject ? review.toObject() : review;
      if (review.scholarshipId) {
        reviewObj.scholarshipName = review.scholarshipId.scholarshipName;
        reviewObj.universityNameFromScholar = review.scholarshipId.universityName;
      }
      return reviewObj;
    });

    res.json(reviewsWithNames);
  } catch (error) {
    console.error('Error fetching reviews:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get reviews by user email
 */
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ 
      userEmail: req.user.email 
    })
      .populate('scholarshipId', 'scholarshipName')
      .sort({ reviewDate: -1 });
    
    const reviewsWithNames = reviews.map(review => {
      const reviewObj = review.toObject ? review.toObject() : review;
      if (review.scholarshipId && review.scholarshipId.scholarshipName) {
        reviewObj.scholarshipName = review.scholarshipId.scholarshipName;
      }
      return reviewObj;
    });

    res.json(reviewsWithNames);
  } catch (error) {
    console.error('Error fetching reviews:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update review (Student - own reviews only)
 */
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { ratingPoint, reviewComment } = req.body;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.userEmail !== req.user.email) {
      return res.status(403).json({ error: 'You can only update your own reviews' });
    }

    review.ratingPoint = ratingPoint || review.ratingPoint;
    review.reviewComment = reviewComment || review.reviewComment;

    await review.save();

    res.json({ 
      success: true, 
      message: 'Review updated successfully',
      review 
    });
  } catch (error) {
    console.error('Error updating review:', error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete review (Student - own reviews only, Moderator - any)
 */
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Allow deletion if:
    // 1. User is the review owner, OR
    // 2. User is a Moderator/Admin
    const isOwner = review.userEmail === req.user.email;
    const isModerator = req.userRole === 'Moderator' || req.userRole === 'Admin';

    if (!isOwner && !isModerator) {
      return res.status(403).json({ error: 'You can only delete your own reviews' });
    }

    await Review.findByIdAndDelete(id);

    res.json({ 
      success: true, 
      message: 'Review deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting review:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createReview,
  getAllReviews,
  getReviewsByScholarship,
  getMyReviews,
  updateReview,
  deleteReview
};
