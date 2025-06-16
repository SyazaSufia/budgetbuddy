const isDevelopment =
  process.env.NODE_ENV === "development" ||
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// Fixed API configuration - always use the same protocol and host as the current page
const API_BASE_URL = isDevelopment
  ? "http://localhost:43210"
  : `${window.location.protocol}//${window.location.host}/api`;

console.log("API_BASE_URL:", API_BASE_URL); // For debugging

export { API_BASE_URL };

// Update the apiRequest function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Important for sessions
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
    console.log("Making API request to:", url);
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if response is expected to be binary data
    if (options.responseType === 'blob') {
      return await response.arrayBuffer();
    }

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error(
        "Server returned non-JSON response:",
        text.substring(0, 200)
      );
      throw new Error(
        "Server returned an error page instead of JSON. Please check your server configuration."
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// API methods (keeping all your existing methods)
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

  //password reset method
  resetPassword: (email, newPassword) =>
    apiRequest("/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, newPassword }),
    }),
};

// Profile API methods
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
  
  // Download pdf method
  downloadPDF: (period = "month") =>
    apiRequest(`/dashboard/download-pdf?period=${period}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf'
      },
      responseType: 'blob'  // This tells fetch to handle binary data
    }),
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
  getBudgets: (timeFilter) => {
    const endpoint = timeFilter
      ? `/budget/budgets?timeFilter=${timeFilter}`
      : "/budget/budgets";
    return apiRequest(endpoint);
  },

  getBudgetDetails: (budgetID) => apiRequest(`/budget/budgets/${budgetID}`),

  addBudget: (budgetData) =>
    apiRequest("/budget/budgets", {
      method: "POST",
      body: JSON.stringify(budgetData),
    }),

  updateBudget: (id, budgetData) =>
    apiRequest(`/budget/budgets/${id}`, {
      method: "PUT",
      body: JSON.stringify(budgetData),
    }),

  deleteBudget: (id) =>
    apiRequest(`/budget/budgets/${id}`, {
      method: "DELETE",
    }),

  // NEW: Validate budget against income
  validateBudgetCreation: (budgetData) =>
    apiRequest("/budget/validate-creation", {
      method: "POST",
      body: JSON.stringify(budgetData),
    }),

  // NEW: Get budget summary for validation
  getBudgetSummary: (month, year) => {
    const endpoint = month && year 
      ? `/budget/summary?month=${month}&year=${year}`
      : "/budget/summary";
    return apiRequest(endpoint);
  },
};

// Category API methods
export const categoryAPI = {
  getCategories: (budgetID) => {
    const endpoint = budgetID
      ? `/budget/categories?budgetID=${budgetID}`
      : "/budget/categories";
    return apiRequest(endpoint);
  },

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

  //Get categories filtered by time period
  getCategoriesForTimeFilter: (timeFilter) => {
    const endpoint = timeFilter
      ? `/budget/categories/time-filter?timeFilter=${timeFilter}`
      : "/budget/categories/time-filter";
    return apiRequest(endpoint);
  },
};

// Enhanced Income API methods
export const incomeAPI = {
  getIncome: () => apiRequest("/income"),

  addIncome: (incomeData) =>
    apiRequest("/income/add", {
      method: "POST",
      body: JSON.stringify(incomeData),
    }),

  updateIncome: (id, incomeData) =>
    apiRequest(`/income/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(incomeData),
    }),

  deleteIncome: (id, deleteAllRecurrences = false) => {
    const queryParams = deleteAllRecurrences
      ? "?deleteAllRecurrences=true"
      : "";
    return apiRequest(`/income/delete/${id}${queryParams}`, {
      method: "DELETE",
    });
  },

  getIncomeStats: (period = "month") =>
    apiRequest(`/income/stats?period=${period}`),

  getIncomeByType: (type) => apiRequest(`/income/type/${type}`),

  getRecurringIncomeSeries: (parentId) =>
    apiRequest(`/income/recurring/${parentId}`),

  // NEW: Get monthly income total
  getMonthlyIncome: (month, year) => {
    const endpoint = month && year 
      ? `/income/monthly?month=${month}&year=${year}`
      : `/income/monthly`;
    return apiRequest(endpoint);
  },

  // NEW: Check if user has income for current month
  checkMonthlyIncomeExists: (month, year) => {
    const endpoint = month && year 
      ? `/income/check-monthly?month=${month}&year=${year}`
      : `/income/check-monthly`;
    return apiRequest(endpoint);
  },
};

// Enhanced Expense API methods
export const expenseAPI = {
  getExpenses: () => apiRequest("/expense/expenses"),

  getCategoryExpenses: (categoryId) =>
    apiRequest(`/expense/categories/${categoryId}/expenses`),

  addExpense: (expenseData) =>
    apiRequest("/expense/expenses", {
      method: "POST",
      body: JSON.stringify(expenseData),
    }),

  updateExpense: (id, expenseData) =>
    apiRequest(`/expense/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(expenseData),
    }),

  deleteExpense: (id) =>
    apiRequest(`/expense/expenses/${id}`, {
      method: "DELETE",
    }),

  processReceipt: (formData) => {
    return fetch(`${API_BASE_URL}/expense/process-receipt`, {
      method: "POST",
      body: formData,
      credentials: "include",
    }).then(async (response) => {
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

  // NEW: Validate expense against budget and income
  validateExpenseAddition: (expenseData) =>
    apiRequest("/expense/validate-addition", {
      method: "POST",
      body: JSON.stringify(expenseData),
    }),

  // NEW: Get monthly expense summary
  getMonthlyExpenseSummary: (month, year) => {
    const endpoint = month && year 
      ? `/expense/monthly-summary?month=${month}&year=${year}`
      : `/expense/monthly-summary`;
    return apiRequest(endpoint);
  },
};

// Community API methods
export const communityAPI = {
  getPosts: (page = 1, limit = 6) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return apiRequest(`/community/posts?${queryParams}`);
  },

  getPostById: (postId) => apiRequest(`/community/posts/${postId}`),

  createPost: (postData) =>
    apiRequest("/community/posts", {
      method: "POST",
      body: JSON.stringify(postData),
    }),

  updatePost: (postId, postData) =>
    apiRequest(`/community/posts/${postId}`, {
      method: "PUT",
      body: JSON.stringify(postData),
    }),

  deletePost: (postId) =>
    apiRequest(`/community/posts/${postId}`, {
      method: "DELETE",
    }),

  addComment: (postId, commentData) =>
    apiRequest(`/community/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(commentData),
    }),

  toggleLike: (postId) =>
    apiRequest(`/community/posts/${postId}/like`, {
      method: "POST",
    }),

  getLikes: (postId) => apiRequest(`/community/posts/${postId}/likes`),
};

export default apiRequest;