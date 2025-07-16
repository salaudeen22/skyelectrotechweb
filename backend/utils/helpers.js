// API Response utility functions

// Success response
const sendResponse = (res, statusCode, data, message = 'Success') => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

// Error response
const sendError = (res, statusCode, message, error = null) => {
  const response = {
    success: false,
    message
  };

  if (error && process.env.NODE_ENV === 'development') {
    response.error = error;
  }

  res.status(statusCode).json(response);
};

// Pagination utility
const paginate = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit) };
};

// Generate pagination metadata
const getPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    currentPage: parseInt(page),
    totalPages,
    totalItems: total,
    itemsPerPage: parseInt(limit),
    hasNext,
    hasPrev,
    nextPage: hasNext ? parseInt(page) + 1 : null,
    prevPage: hasPrev ? parseInt(page) - 1 : null
  };
};

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Generate SKU
const generateSKU = (category, brand, name) => {
  const categoryCode = category.substring(0, 3).toUpperCase();
  const brandCode = brand ? brand.substring(0, 2).toUpperCase() : 'XX';
  const nameCode = name.substring(0, 3).toUpperCase();
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${categoryCode}${brandCode}${nameCode}${randomNum}`;
};

module.exports = {
  sendResponse,
  sendError,
  paginate,
  getPaginationMeta,
  asyncHandler,
  generateSKU
};
