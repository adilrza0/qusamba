// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  // Safely get token from localStorage (handles SSR)
  const token = typeof window !== 'undefined' ? localStorage.getItem('qusamba-token') : null;

  // Prepare base headers
  const baseHeaders = {};

  // Add authorization header if token exists
  if (token) {
    baseHeaders.Authorization = `Bearer ${token}`;
  }

  // Add Content-Type only if not FormData (FormData sets its own Content-Type)
  if (!(options.body instanceof FormData)) {
    baseHeaders['Content-Type'] = 'application/json';
  }

  const config = {
    headers: {
      ...baseHeaders,
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API request failed' }));
    throw new Error(error.message || 'API request failed');
  }

  return await response.json();
};

// Authentication API
export const authAPI = {
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  getProfile: async () => {
    return apiRequest('/auth/profile');
  },

  updateProfile: async (userData) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  forgotPassword: async (email) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token, password) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },

  changePassword: async (currentPassword, newPassword) => {
    return apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// Products API
export const productsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products${queryString ? `?${queryString}` : ''}`);
  },

  getProductTypes: async () => {
    return apiRequest('/products/types');
  },

  getById: async (id) => {
    return apiRequest(`/products/${id}`);
  },

  create: async (productData) => {
    return apiRequest('/products', {
      method: 'POST',
      body: productData, // FormData object
    });
  },

  update: async (id, productData) => {
    return apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: productData, // FormData object
    });
  },

  delete: async (id) => {
    return apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  search: async (query) => {
    return apiRequest(`/products/search?q=${encodeURIComponent(query)}`);
  },

  getByCategory: async (categoryId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products/category/${categoryId}${queryString ? `?${queryString}` : ''}`);
  },

  // Reviews
  addReview: async (productId, reviewData) => {
    return apiRequest(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  getReviews: async (productId) => {
    return apiRequest(`/products/${productId}/reviews`);
  },

  updateReview: async (productId, reviewId, reviewData) => {
    return apiRequest(`/products/${productId}/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  },

  deleteReview: async (productId, reviewId) => {
    return apiRequest(`/products/${productId}/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/categories${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id) => {
    return apiRequest(`/categories/${id}`);
  },

  create: async (categoryData) => {
    return apiRequest('/categories', {
      method: 'POST',
      body: categoryData, // FormData object
    });
  },

  update: async (id, categoryData) => {
    return apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: categoryData, // FormData object
    });
  },

  delete: async (id) => {
    return apiRequest(`/categories/${id}`, {
      method: 'DELETE',
    });
  },

  getTree: async () => {
    return apiRequest('/categories/tree');
  },

  getChildren: async (parentId) => {
    return apiRequest(`/categories/${parentId}/children`);
  },
};

// Orders API
export const ordersAPI = {
  create: async (orderData) => {
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/orders${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id) => {
    return apiRequest(`/orders/${id}`);
  },

  getUserOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/orders${queryString ? `?${queryString}` : ''}`);
  },

  updateStatus: async (id, status) => {
    return apiRequest(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  cancel: async (id) => {
    return apiRequest(`/orders/${id}/cancel`, {
      method: 'PUT',
    });
  },

  // Admin only
  getAllOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/orders/admin/all${queryString ? `?${queryString}` : ''}`);
  },

  getOrderStats: async () => {
    return apiRequest('/orders/admin/stats');
  },

  updateOrderStatus: async (id, data) => {
    return apiRequest(`/orders/admin/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  bulkUpdateOrderStatus: async (data) => {
    return apiRequest('/orders/admin/bulk-update', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getShippingStats: async () => {
    return apiRequest('/orders/admin/stats');
  },

  trackOrder: async (orderNumber) => {
    return apiRequest(`/orders/track/${orderNumber}`);
  },

  // Order approval functions
  getOrdersPendingApproval: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/orders/admin/pending-approval${queryString ? `?${queryString}` : ''}`);
  },

  approveOrder: async (orderId, data = {}) => {
    return apiRequest(`/orders/admin/${orderId}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  bulkApproveOrders: async (data) => {
    return apiRequest('/orders/admin/bulk-approve', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Payments API
export const paymentsAPI = {
  createPaymentIntent: async (amount, currency = 'inr') => {
    return apiRequest('/payments/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, currency }),
    });
  },

  confirmPayment: async (paymentIntentId) => {
    return apiRequest('/payments/confirm-payment', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId }),
    });
  },

  getPaymentHistory: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/payments/history${queryString ? `?${queryString}` : ''}`);
  },

  refundPayment: async (paymentIntentId, amount) => {
    return apiRequest('/payments/refund', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId, amount }),
    });
  },

  getPaymentMethods: async () => {
    return apiRequest('/payments/methods');
  },

  savePaymentMethod: async (paymentMethodData) => {
    return apiRequest('/payments/methods', {
      method: 'POST',
      body: JSON.stringify(paymentMethodData),
    });
  },
};

// Cart API (if backend handles cart)
export const cartAPI = {
  get: async () => {
    return apiRequest('/cart');
  },

  add: async (productId, quantity = 1, color = null, size = null) => {
    console.log('Adding item to cart:', { productId, quantity, color, size });
    return apiRequest('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, color, size }),
    });
  },

  update: async (productId, quantity, color = null, size = null) => {
    return apiRequest('/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity, color, size }),
    });
  },

  remove: async (productId, color = null, size = null) => {
    console.log('Removing item from cart:', { productId, color, size });
    return apiRequest('/cart/remove', {
      method: 'DELETE',
      body: JSON.stringify({ productId, color, size }),
    });
  },

  clear: async () => {
    return apiRequest('/cart/clear', {
      method: 'DELETE',
    });
  },
};

// Wishlist API
export const wishlistAPI = {
  get: async () => {
    return apiRequest('/wishlist');
  },

  add: async (productId) => {
    return apiRequest('/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  remove: async (productId) => {
    return apiRequest('/wishlist/remove', {
      method: 'DELETE',
      body: JSON.stringify({ productId }),
    });
  },

  clear: async () => {
    return apiRequest('/wishlist/clear', {
      method: 'DELETE',
    });
  },
};

// Admin API
export const adminAPI = {
  getDashboardStats: async () => {
    return apiRequest('/admin/dashboard/stats');
  },

  getUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/users${queryString ? `?${queryString}` : ''}`);
  },

  updateUser: async (id, userData) => {
    return apiRequest(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (id) => {
    return apiRequest(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  getSalesReport: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/dashboard/sales${queryString ? `?${queryString}` : ''}`);
  },

  getInventoryReport: async () => {
    return apiRequest('/admin/dashboard/inventory');
  },
};

// Address API
export const addressAPI = {
  getAll: async () => {
    return apiRequest('/addresses');
  },

  add: async (addressData) => {
    return apiRequest('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  },

  update: async (addressId, addressData) => {
    return apiRequest(`/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  },

  delete: async (addressId) => {
    return apiRequest(`/addresses/${addressId}`, {
      method: 'DELETE',
    });
  },

  setDefault: async (addressId) => {
    return apiRequest(`/addresses/${addressId}/default`, {
      method: 'PATCH',
    });
  },
};

// Utility functions
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  return apiRequest('/upload/image', {
    method: 'POST',
    body: formData,
  });
};

export const uploadMultipleImages = async (files) => {
  const formData = new FormData();
  files.forEach(file => formData.append('images', file));

  return apiRequest('/upload/images', {
    method: 'POST',
    body: formData,
  });
};

// Error handling utility
export const handleAPIError = (error) => {
  console.error('API Error:', error);

  if (error.message.includes('unauthorized') || error.message.includes('401')) {
    // Handle unauthorized access
    localStorage.removeItem('qusamba-token');
    window.location.href = '/login';
  }

  return error.message || 'An error occurred';
};

export default {
  authAPI,
  productsAPI,
  categoriesAPI,
  ordersAPI,
  paymentsAPI,
  cartAPI,
  wishlistAPI,
  adminAPI,
  uploadImage,
  uploadMultipleImages,
  handleAPIError,
};
