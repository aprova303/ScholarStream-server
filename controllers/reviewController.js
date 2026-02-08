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
 * Get all reviews
 */
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ reviewDate: -1 });
    res.json(reviews);
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
      .sort({ reviewDate: -1 });

    res.json(reviews);
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
    }).sort({ reviewDate: -1 });

    res.json(reviews);
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
 * Delete review (Student - own reviews only)
 */
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.userEmail !== req.user.email) {
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
