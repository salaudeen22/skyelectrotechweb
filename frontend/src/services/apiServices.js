import api from './api';

// Auth API calls
export const authAPI = {
  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Request OTP for profile update
  requestProfileUpdateOTP: async () => {
    const response = await api.post('/auth/profile/request-otp');
    return response.data;
  },

  // Update profile with OTP
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  // Address management
  getAddresses: async () => {
    const response = await api.get('/auth/addresses');
    return response.data;
  },

  addAddress: async (addressData) => {
    const response = await api.post('/auth/addresses', addressData);
    return response.data;
  },

  updateAddress: async (addressId, addressData) => {
    const response = await api.put(`/auth/addresses/${addressId}`, addressData);
    return response.data;
  },

  deleteAddress: async (addressId) => {
    const response = await api.delete(`/auth/addresses/${addressId}`);
    return response.data;
  },

  setDefaultAddress: async (addressId) => {
    const response = await api.put(`/auth/addresses/${addressId}/default`);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/password', passwordData);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, password) => {
    const response = await api.put(`/auth/reset-password/${token}`, { password });
    return response.data;
  },

  // Avatar management
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteAvatar: async () => {
    const response = await api.delete('/auth/avatar');
    return response.data;
  }
};

// Products API calls
export const productsAPI = {
  // Get all products
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get single product
  getProduct: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create product (Admin only)
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update product (Admin only)
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product (Admin only)
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Add product review
  addReview: async (productId, reviewData) => {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  },

  // Delete product review
  deleteReview: async (productId, reviewId) => {
    const response = await api.delete(`/products/${productId}/reviews/${reviewId}`);
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async (limit = 8) => {
    const response = await api.get('/products/featured', { params: { limit } });
    return response.data;
  },

  // Search products
  searchProducts: async (query, params = {}) => {
    const response = await api.get('/products/search', { 
      params: { q: query, ...params } 
    });
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (categoryId, params = {}) => {
    const response = await api.get(`/products/category/${categoryId}`, { params });
    return response.data;
  }
};

// Categories API calls
export const categoriesAPI = {
  // Get all categories
  getCategories: async (active = true) => {
    const response = await api.get(`/categories?active=${active}`);
    return response.data;
  },

  // Get single category
  getCategory: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Create category (Admin only)
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // Update category (Admin only)
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete category (Admin only)
  deleteCategory: async (id, force = false) => {
    const response = await api.delete(`/categories/${id}?force=${force}`);
    return response.data;
  }
};

// Orders API calls
export const ordersAPI = {
  // Create order
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Get user orders
  getMyOrders: async (params = {}) => {
    const response = await api.get('/orders/my-orders', { params });
    return response.data;
  },

  // Get single order
  getOrder: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id, data) => {
    const response = await api.put(`/orders/${id}/cancel`, data);
    return response.data;
  },

  // Return order
  returnOrder: async (id, formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    const response = await api.put(`/orders/${id}/return`, formData, config);
    return response.data;
  },

  // Update order status (Admin/Employee)
  updateOrderStatus: async (id, statusData) => {
    const response = await api.put(`/orders/${id}/status`, statusData);
    return response.data;
  },

  // Get all orders (Admin)
  getAllOrders: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  // Get assigned orders (Employee)
  getAssignedOrders: async (params = {}) => {
    const response = await api.get('/orders/employee/assigned', { params });
    return response.data;
  },

  // Assign order to employee (Admin)
  assignOrder: async (id, employeeId) => {
    const response = await api.put(`/orders/${id}/assign`, { employeeId });
    return response.data;
  },

  // Export today's sales invoice (Admin)
  exportTodaySalesInvoice: async () => {
    const response = await api.get('/orders/today-sales-invoice', {
      responseType: 'blob',
      timeout: 60000 // Increase timeout to 60 seconds for PDF generation
    });
    return response;
  },

  // Export individual order invoice
  exportOrderInvoice: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/invoice`, {
      responseType: 'blob',
      timeout: 60000 // Increase timeout to 60 seconds for PDF generation
    });
    return response;
  },

  // Get all return requests (Admin)
  getReturnRequests: async (params = {}) => {
    const response = await api.get('/orders/return-requests', { params });
    return response.data;
  },

  // Get return requests for a specific order
  getOrderReturnRequests: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/return-requests`);
    return response.data;
  },

  // Process return request (Approve/Reject)
  processReturnRequest: async (requestId, data) => {
    const response = await api.put(`/orders/return-requests/${requestId}/process`, data);
    return response.data;
  }
};

// Cart API calls
export const cartAPI = {
  // Get cart
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  // Add to cart
  addToCart: async (productId, quantity = 1) => {
    const response = await api.post('/cart/add', { productId, quantity });
    return response.data;
  },

  // Update cart item
  updateCartItem: async (productId, quantity) => {
    const response = await api.put(`/cart/item/${productId}`, { quantity });
    return response.data;
  },

  // Remove from cart
  removeFromCart: async (productId) => {
    const response = await api.delete(`/cart/item/${productId}`);
    return response.data;
  },

  // Clear cart
  clearCart: async () => {
    const response = await api.delete('/cart/clear');
    return response.data;
  }
};

// Wishlist API calls
export const wishlistAPI = {
  // Get wishlist
  getWishlist: async () => {
    const response = await api.get('/wishlist');
    return response.data;
  },

  // Add to wishlist
  addToWishlist: async (productId) => {
    const response = await api.post('/wishlist/add', { productId });
    return response.data;
  },

  // Remove from wishlist
  removeFromWishlist: async (productId) => {
    const response = await api.delete(`/wishlist/item/${productId}`);
    return response.data;
  },

  // Clear wishlist
  clearWishlist: async () => {
    const response = await api.delete('/wishlist/clear');
    return response.data;
  }
};

// Users API calls (Admin only)
export const usersAPI = {
  // Get all users
  getAllUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Get single user
  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create employee
  createEmployee: async (userData) => {
    const response = await api.post('/users/employee', userData);
    return response.data;
  },

  // Update user
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Get user stats
  getUserStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  }
};

// Analytics API calls
export const analyticsAPI = {
  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },

  // Get sales analytics
  getSalesAnalytics: async (params = {}) => {
    const response = await api.get('/analytics/sales', { params });
    return response.data;
  },

  // Get product analytics
  getProductAnalytics: async () => {
    const response = await api.get('/analytics/products');
    return response.data;
  },

  // Get order analytics
  getOrderAnalytics: async () => {
    const response = await api.get('/analytics/orders');
    return response.data;
  },

  // Get activity logs
  getActivityLogs: async (params = {}) => {
    const response = await api.get('/analytics/activity-logs', { params });
    return response.data;
  },

  // Get customer analytics
  getCustomerAnalytics: async (params = {}) => {
    const response = await api.get('/analytics/customers', { params });
    return response.data;
  },

  // Get performance metrics
  getPerformanceMetrics: async (params = {}) => {
    const response = await api.get('/analytics/performance', { params });
    return response.data;
  }
};

// Settings API calls
export const settingsAPI = {
  // Get all settings
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  // Update settings
  updateSettings: async (settingsData) => {
    const response = await api.put('/settings', settingsData);
    return response.data;
  },

  // Get public settings
  getPublicSettings: async () => {
    const response = await api.get('/settings/public');
    return response.data;
  },

  // Calculate shipping cost
  calculateShippingCost: async (shippingData) => {
    const response = await api.post('/settings/calculate-shipping', shippingData);
    return response.data;
  },

  // Shipping methods
  addShippingMethod: async (methodData) => {
    const response = await api.post('/settings/shipping-methods', methodData);
    return response.data;
  },

  updateShippingMethod: async (methodId, methodData) => {
    const response = await api.put(`/settings/shipping-methods/${methodId}`, methodData);
    return response.data;
  },

  deleteShippingMethod: async (methodId) => {
    const response = await api.delete(`/settings/shipping-methods/${methodId}`);
    return response.data;
  },

  // Shipping zones
  addShippingZone: async (zoneData) => {
    const response = await api.post('/settings/shipping-zones', zoneData);
    return response.data;
  },

  updateShippingZone: async (zoneId, zoneData) => {
    const response = await api.put(`/settings/shipping-zones/${zoneId}`, zoneData);
    return response.data;
  },

  deleteShippingZone: async (zoneId) => {
    const response = await api.delete(`/settings/shipping-zones/${zoneId}`);
    return response.data;
  }
};

// Payment API calls
export const paymentAPI = {
  // Create payment order
  createPaymentOrder: async (orderData) => {
    const response = await api.post('/payments/create-order', orderData);
    return response.data;
  },

  // Verify payment
  verifyPayment: async (paymentData) => {
    const response = await api.post('/payments/verify', paymentData);
    return response.data;
  },

  // Get payment methods
  getPaymentMethods: async () => {
    const response = await api.get('/payments/methods');
    return response.data;
  },

  // Get payment details (Admin)
  getPaymentDetails: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  },

  // Process refund (Admin)
  processRefund: async (refundData) => {
    const response = await api.post('/payments/refund', refundData);
    return response.data;
  },

  // Retry failed payment
  retryPayment: async (paymentId, delayMinutes = 5) => {
    const response = await api.post(`/payments/retry/${paymentId}`, { delayMinutes });
    return response.data;
  },

  // Synchronize payment status (Admin)
  synchronizePaymentStatus: async (paymentId) => {
    const response = await api.post(`/payments/sync/${paymentId}`);
    return response.data;
  },

  // Get payment statistics (Admin)
  getPaymentStats: async () => {
    const response = await api.get('/payments/stats/overview');
    return response.data;
  },

  // Process expired payments (Admin)
  processExpiredPayments: async () => {
    const response = await api.post('/payments/process-expired');
    return response.data;
  },

  // Retry failed payments (Admin)
  retryFailedPayments: async () => {
    const response = await api.post('/payments/retry-failed');
    return response.data;
  }
};

// Upload API calls
export const uploadAPI = {
  // Upload single image
  uploadSingle: async (file, folder) => {
    const formData = new FormData();
    formData.append('image', file);
    if (folder) formData.append('folder', folder);

    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload multiple images
  uploadMultiple: async (files, folder) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    if (folder) formData.append('folder', folder);

    const response = await api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete image
  deleteImage: async (publicId) => {
    const response = await api.delete(`/upload/image/${encodeURIComponent(publicId)}`);
    return response.data;
  }
};

// Bulk Upload API
export const bulkUploadAPI = {
  // Download CSV template
  downloadTemplate: async () => {
    const response = await api.get('/bulk-upload/template', {
      responseType: 'blob',
    });
    return response;
  },

  // Export existing products to CSV
  exportProducts: async () => {
    const response = await api.get('/bulk-upload/export', {
      responseType: 'blob',
    });
    return response;
  },

  // Get database statistics
  getDatabaseStats: async () => {
    const response = await api.get('/bulk-upload/stats');
    return response.data;
  },

  // Bulk upload products from CSV
  uploadProducts: async (csvFile, onProgress) => {
    const formData = new FormData();
    formData.append('csvFile', csvFile);

    const response = await api.post('/bulk-upload/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });
    return response.data;
  },

  // Bulk update products
  updateProducts: async (updates) => {
    const response = await api.put('/bulk-upload/products', { updates });
    return response.data;
  },

  // Bulk delete products
  deleteProducts: async (productIds) => {
    const response = await api.delete('/bulk-upload/products', {
      data: { productIds }
    });
    return response.data;
  }
};

// Comments API calls
export const commentsAPI = {
  // Get all comments (Admin)
  getAllComments: async (params = {}) => {
    const response = await api.get('/comments', { params });
    return response.data;
  },

  // Get comment statistics (Admin)
  getCommentStats: async () => {
    const response = await api.get('/comments/stats');
    return response.data;
  },

  // Update comment status (Admin)
  updateCommentStatus: async (commentId, status) => {
    const response = await api.put(`/comments/${commentId}/status`, { status });
    return response.data;
  },

  // Delete comment (Admin)
  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },

  // Get product comments (Public)
  getProductComments: async (productId, params = {}) => {
    const response = await api.get(`/comments/product/${productId}`, { params });
    return response.data;
  },

  // Create comment (User)
  createComment: async (commentData) => {
    const response = await api.post('/comments', commentData);
    return response.data;
  },

  // Update comment (User)
  updateComment: async (commentId, commentData) => {
    const response = await api.put(`/comments/${commentId}`, commentData);
    return response.data;
  },

  // Add reply to comment
  addReply: async (commentId, replyData) => {
    const response = await api.post(`/comments/${commentId}/replies`, replyData);
    return response.data;
  },

  // Vote on comment
  voteComment: async (commentId, vote) => {
    const response = await api.post(`/comments/${commentId}/vote`, { vote });
    return response.data;
  }
};

// Services API calls
export const servicesAPI = {
  // Submit service request
  submitServiceRequest: async (serviceData) => {
    const response = await api.post('/services/submit', serviceData);
    return response.data;
  },

  // Get all service requests (Admin)
  getAllServiceRequests: async (params = {}) => {
    const response = await api.get('/services/requests', { params });
    return response.data;
  },

  // Get service request by ID (Admin)
  getServiceRequestById: async (requestId) => {
    const response = await api.get(`/services/requests/${requestId}`);
    return response.data;
  },

  // Update service request status (Admin)
  updateServiceRequestStatus: async (requestId, statusData) => {
    const response = await api.patch(`/services/requests/${requestId}/status`, statusData);
    return response.data;
  }
};

// Recommendations API calls
export const recommendationsAPI = {
  // Track product view
  trackProductView: async (productId) => {
    const response = await api.post('/recommendations/track-view', { productId });
    return response.data;
  },

  // Track product interaction
  trackInteraction: async (productId, action, metadata = {}) => {
    const response = await api.post('/recommendations/track-interaction', { 
      productId, 
      action, 
      metadata 
    });
    return response.data;
  },

  // Get recently viewed products
  getRecentlyViewed: async (limit = 8) => {
    const response = await api.get('/recommendations/recently-viewed', { 
      params: { limit } 
    });
    return response.data;
  },

  // Get personalized recommendations
  getRecommendations: async (limit = 8) => {
    const response = await api.get('/recommendations', { 
      params: { limit } 
    });
    return response.data;
  },

  // Get category recommendations
  getCategoryRecommendations: async (categoryId, limit = 8) => {
    const response = await api.get(`/recommendations/category/${categoryId}`, { 
      params: { limit } 
    });
    return response.data;
  },

  // Get trending products
  getTrendingProducts: async (limit = 8) => {
    const response = await api.get('/recommendations/trending', { 
      params: { limit } 
    });
    return response.data;
  },

  // Get similar products
  getSimilarProducts: async (productId, limit = 8) => {
    const response = await api.get(`/recommendations/similar/${productId}`, { 
      params: { limit } 
    });
    return response.data;
  }
};

// Export aliases for backward compatibility
export const authServices = authAPI;
export const productServices = productsAPI;
export const categoryServices = categoriesAPI;
export const orderServices = ordersAPI;
export const cartServices = cartAPI;
export const wishlistServices = wishlistAPI;
export const userServices = usersAPI;
export const analyticsServices = analyticsAPI;
export const uploadServices = uploadAPI;
export const bulkUploadServices = bulkUploadAPI;
export const commentServices = commentsAPI;
export const serviceServices = servicesAPI;
export const recommendationServices = recommendationsAPI;
