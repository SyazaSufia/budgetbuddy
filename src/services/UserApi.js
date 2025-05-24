// Simplified and more reliable API base URL detection
const getApiBaseUrl = () => {
  // Development detection
  const isDevelopment = 
    process.env.NODE_ENV === "development" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (isDevelopment) {
    return "http://localhost:43210";
  }

  // Production - use relative URLs for API calls
  // This works regardless of domain (budgetbuddy.space or IP)
  return "/api";
};

const API_BASE_URL = getApiBaseUrl();

console.log("API Base URL:", API_BASE_URL); // Debug log

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // This is crucial for session cookies
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
    console.log(`Making API request to: ${url}`); // Debug log
    const response = await fetch(url, config);
    
    // Log response details for debugging
    console.log(`Response status: ${response.status} for ${url}`);
    
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
  signUp: (userData) =>
    apiRequest("/sign-up", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  signIn: (credentials) =>
    apiRequest("/sign-in", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  signOut: () =>
    apiRequest("/sign-out", {
      method: "POST",
    }),

  checkAuth: () => apiRequest("/check-auth"),

  getUserDetails: () => apiRequest("/get-user-details"),

  updateProfile: (profileData) =>
    apiRequest("/update-profile", {
      method: "POST",
      body: JSON.stringify(profileData),
    }),
};

// Profile API methods - dedicated methods for profile management
export const profileAPI = {
  getUserDetails: () => apiRequest("/get-user-details"),

  updateProfile: (profileData) =>
    apiRequest("/update-profile", {
      method: "POST",
      body: JSON.stringify(profileData),
    }),

  updateAvatar: (avatarPath) =>
    apiRequest("/update-profile", {
      method: "POST",
      body: JSON.stringify({ profileImage: avatarPath }),
    }),
};

// Dashboard API methods
export const dashboardAPI = {
  getSummary: (period = "month") =>
    apiRequest(`/dashboard/summary?period=${period}`),
};

// Advertisement API methods
export const advertisementAPI = {
  getActiveAds: (limit = 3) =>
    apiRequest(`/advertisement/active?limit=${limit}`),
  getAds: () => apiRequest("/advertisement"),
  addAd: (adData) =>
    apiRequest("/advertisement", {
      method: "POST",
      body: JSON.stringify(adData),
    }),
  updateAd: (id, adData) =>
    apiRequest(`/advertisement/${id}`, {
      method: "PUT",
      body: JSON.stringify(adData),
    }),
  deleteAd: (id) =>
    apiRequest(`/advertisement/${id}`, {
      method: "DELETE",
    }),
};

// Enhanced Budget API methods
export const budgetAPI = {
  // Get budgets with optional time filter
  getBudgets: (timeFilter) => {
    const endpoint = timeFilter
      ? `/budget/budgets?timeFilter=${timeFilter}`
      : "/budget/budgets";
    return apiRequest(endpoint);
  },

  // Get detailed budget information including categories
  getBudgetDetails: (budgetID) => apiRequest(`/budget/budgets/${budgetID}`),

  // Add new budget
  addBudget: (budgetData) =>
    apiRequest("/budget/budgets", {
      method: "POST",
      body: JSON.stringify(budgetData),
    }),

  // Update existing budget
  updateBudget: (id, budgetData) =>
    apiRequest(`/budget/budgets/${id}`, {
      method: "PUT",
      body: JSON.stringify(budgetData),
    }),

  // Delete budget
  deleteBudget: (id) =>
    apiRequest(`/budget/budgets/${id}`, {
      method: "DELETE",
    }),

  // Legacy methods for backward compatibility (if your backend still uses these endpoints)
  getLegacyBudgets: () => apiRequest("/budget"),
  addLegacyBudget: (budgetData) =>
    apiRequest("/budget", {
      method: "POST",
      body: JSON.stringify(budgetData),
    }),
  updateLegacyBudget: (id, budgetData) =>
    apiRequest(`/budget/${id}`, {
      method: "PUT",
      body: JSON.stringify(budgetData),
    }),
  deleteLegacyBudget: (id) =>
    apiRequest(`/budget/${id}`, {
      method: "DELETE",
    }),
};

// Category API methods (for budget categories)
export const categoryAPI = {
  getCategories: (budgetID) => {
    const endpoint = budgetID
      ? `/budget/categories?budgetID=${budgetID}`
      : "/budget/categories";
    return apiRequest(endpoint);
  },

  // Get a specific category by ID
  getCategory: (id) => apiRequest(`/budget/categories/${id}`),

  addCategory: (categoryData) =>
    apiRequest("/budget/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    }),

  updateCategory: (id, categoryData) =>
    apiRequest(`/budget/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    }),

  deleteCategory: (id) =>
    apiRequest(`/budget/categories/${id}`, {
      method: "DELETE",
    }),
};

// Income API methods
export const incomeAPI = {
  // Get all income entries
  getIncome: () => apiRequest("/income"),

  // Add a new income entry
  addIncome: (incomeData) =>
    apiRequest("/income/add", {
      method: "POST",
      body: JSON.stringify(incomeData),
    }),

  // Update an existing income entry
  updateIncome: (id, incomeData) =>
    apiRequest(`/income/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(incomeData),
    }),

  // Delete an income entry (with optional recurring parameter)
  deleteIncome: (id, deleteAllRecurrences = false) => {
    const queryParams = deleteAllRecurrences
      ? "?deleteAllRecurrences=true"
      : "";
    return apiRequest(`/income/delete/${id}${queryParams}`, {
      method: "DELETE",
    });
  },

  // Get income statistics for dashboard
  getIncomeStats: (period = "month") =>
    apiRequest(`/income/stats?period=${period}`),

  // Get income by type (Active/Passive)
  getIncomeByType: (type) => apiRequest(`/income/type/${type}`),

  // Get recurring income series
  getRecurringIncomeSeries: (parentId) =>
    apiRequest(`/income/recurring/${parentId}`),
};

// Expense API methods
export const expenseAPI = {
  // Get all expenses
  getExpenses: () => apiRequest("/expense/expenses"),

  // Get expenses for a specific category
  getCategoryExpenses: (categoryId) =>
    apiRequest(`/expense/categories/${categoryId}/expenses`),

  // Add a new expense
  addExpense: (expenseData) =>
    apiRequest("/expense/expenses", {
      method: "POST",
      body: JSON.stringify(expenseData),
    }),

  // Update an existing expense
  updateExpense: (id, expenseData) =>
    apiRequest(`/expense/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(expenseData),
    }),

  // Delete an expense
  deleteExpense: (id) =>
    apiRequest(`/expense/expenses/${id}`, {
      method: "DELETE",
    }),

  // Process receipt image
  processReceipt: (formData) => {

    return fetch(`${API_BASE_URL}/expense/process-receipt`, {
      method: "POST",
      body: formData,
      credentials: "include", // Important for cookies/session
    }).then(async (response) => {
      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data.message || `HTTP error! status: ${response.status}`
          );
        }
        return data;
      } else {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${text}`);
      }
    });
  },
};

// Community API methods
export const communityAPI = {
  // Get all posts with pagination
  getPosts: (page = 1, limit = 6) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return apiRequest(`/community/posts?${queryParams}`);
  },

  // Get a specific post by ID with comments
  getPostById: (postId) => apiRequest(`/community/posts/${postId}`),

  // Create a new post
  createPost: (postData) =>
    apiRequest("/community/posts", {
      method: "POST",
      body: JSON.stringify(postData),
    }),

  // Update an existing post
  updatePost: (postId, postData) =>
    apiRequest(`/community/posts/${postId}`, {
      method: "PUT",
      body: JSON.stringify(postData),
    }),

  // Delete a post
  deletePost: (postId) =>
    apiRequest(`/community/posts/${postId}`, {
      method: "DELETE",
    }),

  // Add a comment to a post
  addComment: (postId, commentData) =>
    apiRequest(`/community/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(commentData),
    }),

  // Toggle like/unlike on a post
  toggleLike: (postId) =>
    apiRequest(`/community/posts/${postId}/like`, {
      method: "POST",
    }),

  // Get likes for a post
  getLikes: (postId) => apiRequest(`/community/posts/${postId}/likes`),
};

export default apiRequest;