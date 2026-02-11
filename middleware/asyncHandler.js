// Wrapper function to handle async errors in route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    if (typeof next === 'function') {
      next(err);
    } else {
      res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  });
};

module.exports = asyncHandler;
   