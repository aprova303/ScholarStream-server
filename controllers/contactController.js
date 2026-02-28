const Contact = require('../models/Contact');
const asyncHandler = require('../middleware/asyncHandler');

// Create a new contact message
const createContact = asyncHandler(async (req, res) => {
  const { fullName, email, subject, message } = req.body;

  // Validate input
  if (!fullName || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields',
      error: 'Missing required fields'
    });
  }

  // Create contact document
  const contact = new Contact({
    fullName,
    email,
    subject,
    message,
    status: 'new'
  });

  const savedContact = await contact.save();

  res.status(201).json({
    success: true,
    message: 'Your message has been received. We will get back to you soon!',
    data: savedContact
  });
});

// Get all contact messages (Admin/Moderator only)
const getAllContacts = asyncHandler(async (req, res) => {
  const { status = '', page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const filter = {};
  if (status) {
    filter.status = status;
  }

  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  const sortObj = {};
  sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const contacts = await Contact.find(filter)
    .sort(sortObj)
    .skip(skip)
    .limit(limitNum);

  const totalContacts = await Contact.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: 'Contacts retrieved successfully',
    data: contacts,
    pagination: {
      total: totalContacts,
      pages: Math.ceil(totalContacts / limitNum),
      currentPage: pageNum,
      pageSize: limitNum
    }
  });
});

// Get a single contact message by ID
const getContactById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const contact = await Contact.findById(id);

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: 'Contact message not found',
      error: 'Contact not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Contact retrieved successfully',
    data: contact
  });
});

// Update contact status and add response
const updateContact = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, response, respondedBy } = req.body;

  const contact = await Contact.findById(id);

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: 'Contact message not found',
      error: 'Contact not found'
    });
  }

  // Update fields if provided
  if (status) {
    contact.status = status;
  }

  if (response) {
    contact.response = response;
    contact.respondedBy = respondedBy || 'Admin';
    contact.respondedAt = new Date();
  }

  contact.updatedAt = new Date();
  const updatedContact = await contact.save();

  res.status(200).json({
    success: true,
    message: 'Contact updated successfully',
    data: updatedContact
  });
});

// Delete a contact message
const deleteContact = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const contact = await Contact.findByIdAndDelete(id);

  if (!contact) {
    return res.status(404).json({
      success: false,
      message: 'Contact message not found',
      error: 'Contact not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Contact deleted successfully',
    data: contact
  });
});

// Get contact statistics
const getContactStats = asyncHandler(async (req, res) => {
  const stats = await Contact.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const totalContacts = await Contact.countDocuments();
  const newContacts = await Contact.countDocuments({ status: 'new' });
  const repliedContacts = await Contact.countDocuments({ status: 'replied' });

  res.status(200).json({
    success: true,
    message: 'Contact statistics retrieved successfully',
    data: {
      total: totalContacts,
      new: newContacts,
      replied: repliedContacts,
      byStatus: stats
    }
  });
});

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
  getContactStats
};
