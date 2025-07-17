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

  // Update profile
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
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

  // Google OAuth login
  googleLogin: async (idToken) => {
    const response = await api.post('/auth/google', { idToken });
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
  cancelOrder: async (id) => {
    const response = await api.put(`/orders/${id}/cancel`);
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
  }
};

// Upload API calls
export const uploadAPI = {
  // Upload single image
  uploadSingle: async (file, folder) => {
    const formData = new FormData();
    formData.append('image', file);
    if (folder) formData.append('folder', folder);

    const response = await api.post('/upload/single', formData, {
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
