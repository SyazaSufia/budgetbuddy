// Environment detection - matches config/api.js pattern
const isDevelopment = process.env.NODE_ENV === 'development' || 
                     window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

// Base API URL that adapts based on environment
const API_BASE_URL = isDevelopment 
  ? 'http://localhost:43210' 
  : 'http://145.79.12.85:43210'; // Update this to match your production URL

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for sessions
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// API methods
export const authAPI = {
  signUp: (userData) => apiRequest('/sign-up', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  signIn: (credentials) => apiRequest('/sign-in', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  signOut: () => apiRequest('/sign-out', {
    method: 'POST',
  }),
  
  checkAuth: () => apiRequest('/check-auth'),
  
  getUserDetails: () => apiRequest('/get-user-details'),
  
  updateProfile: (profileData) => apiRequest('/update-profile', {
    method: 'POST',
    body: JSON.stringify(profileData),
  }),
};

// Profile API methods - dedicated methods for profile management
export const profileAPI = {
  getUserDetails: () => apiRequest('/get-user-details'),
  
  updateProfile: (profileData) => apiRequest('/update-profile', {
    method: 'POST',
    body: JSON.stringify(profileData),
  }),
  
  updateAvatar: (avatarPath) => apiRequest('/update-profile', {
    method: 'POST',
    body: JSON.stringify({ profileImage: avatarPath }),
  }),
};

// Dashboard API methods
export const dashboardAPI = {
  getSummary: (period = 'month') => apiRequest(`/dashboard/summary?period=${period}`),
};

// Advertisement API methods
export const advertisementAPI = {
  getActiveAds: (limit = 3) => apiRequest(`/advertisement/active?limit=${limit}`),
  getAds: () => apiRequest('/advertisement'),
  addAd: (adData) => apiRequest('/advertisement', {
    method: 'POST',
    body: JSON.stringify(adData),
  }),
  updateAd: (id, adData) => apiRequest(`/advertisement/${id}`, {
    method: 'PUT',
    body: JSON.stringify(adData),
  }),
  deleteAd: (id) => apiRequest(`/advertisement/${id}`, {
    method: 'DELETE',
  }),
};

// Other API methods for your controllers
export const incomeAPI = {
  getIncome: () => apiRequest('/income'),
  addIncome: (incomeData) => apiRequest('/income', {
    method: 'POST',
    body: JSON.stringify(incomeData),
  }),
  updateIncome: (id, incomeData) => apiRequest(`/income/${id}`, {
    method: 'PUT',
    body: JSON.stringify(incomeData),
  }),
  deleteIncome: (id) => apiRequest(`/income/${id}`, {
    method: 'DELETE',
  }),
};

export const expenseAPI = {
  getExpenses: () => apiRequest('/expense'),
  addExpense: (expenseData) => apiRequest('/expense', {
    method: 'POST',
    body: JSON.stringify(expenseData),
  }),
  updateExpense: (id, expenseData) => apiRequest(`/expense/${id}`, {
    method: 'PUT',
    body: JSON.stringify(expenseData),
  }),
  deleteExpense: (id) => apiRequest(`/expense/${id}`, {
    method: 'DELETE',
  }),
};

export const budgetAPI = {
  getBudgets: () => apiRequest('/budget'),
  addBudget: (budgetData) => apiRequest('/budget', {
    method: 'POST',
    body: JSON.stringify(budgetData),
  }),
  updateBudget: (id, budgetData) => apiRequest(`/budget/${id}`, {
    method: 'PUT',
    body: JSON.stringify(budgetData),
  }),
  deleteBudget: (id) => apiRequest(`/budget/${id}`, {
    method: 'DELETE',
  }),
};

export default apiRequest;