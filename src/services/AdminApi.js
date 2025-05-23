const isDevelopment =
  process.env.NODE_ENV === "development" ||
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// Base API URL that adapts based on environment
const API_BASE_URL = isDevelopment
  ? "http://localhost:43210"
  : window.location.hostname === "budgetbuddy.space" 
    ? "https://budgetbuddy.space/api"  // If using nginx proxy
    : "/api";    // Direct IP access

const adminApiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}/admin${endpoint}`;

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Important for sessions
  };

  // Handle FormData - don't set Content-Type for multipart/form-data
  const config = {
    ...defaultOptions,
    ...options,
  };

  if (options.body instanceof FormData) {
    // Remove Content-Type header to let browser set it with boundary
    delete config.headers["Content-Type"];
  } else {
    config.headers = {
      ...defaultOptions.headers,
      ...options.headers,
    };
  }

  try {
    const response = await fetch(url, config);
    
    // Check if response is actually JSON
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");
    
    let data;
    if (isJson) {
      data = await response.json();
    } else {
      // Handle non-JSON responses (like HTML error pages)
      const text = await response.text();
      console.warn(`Non-JSON response from ${endpoint}:`, text.substring(0, 200));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}. Endpoint may not exist or server may be down.`);
      }
      
      // For successful non-JSON responses, return a default success object
      data = { success: true, message: "Operation completed" };
    }

    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`Admin API Error (${endpoint}):`, error);
    
    // Enhance error message for common issues
    if (error.message.includes('Failed to fetch')) {
      throw new Error(`Cannot connect to server at ${API_BASE_URL}. Please check if the server is running.`);
    }
    
    if (error.message.includes('Unexpected token')) {
      throw new Error(`Server returned invalid response. The endpoint ${endpoint} may not exist or may be misconfigured.`);
    }
    
    throw error;
  }
};

// Admin Authentication API methods (if needed in the future)
export const adminAuthAPI = {
  signIn: (credentials) =>
    adminApiRequest("/sign-in", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  signOut: () =>
    adminApiRequest("/sign-out", {
      method: "POST",
    }),

  checkAuth: () => adminApiRequest("/check-auth"),

  getUserDetails: () => adminApiRequest("/get-user-details"),
};

// User Management API methods - matches your existing routes
export const adminUserAPI = {
  // GET /admin/users
  getAllUsers: (page = 1, limit = 50, search = "") => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });
    return adminApiRequest(`/users?${queryParams}`);
  },

  // GET /admin/users/:id
  getUserById: (userId) => adminApiRequest(`/users/${userId}`),

  // PUT /admin/users/:id (for future use)
  updateUser: (userId, userData) =>
    adminApiRequest(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    }),

  // DELETE /admin/users/:id
  deleteUser: (userId) =>
    adminApiRequest(`/users/${userId}`, {
      method: "DELETE",
    }),

  // Additional methods for future backend implementation
  getUserStats: () => adminApiRequest("/users/stats"),
  exportUsers: (format = "csv") => adminApiRequest(`/users/export?format=${format}`),
};

// Advertisement Management API methods - matches your existing routes
export const adminAdvertisementAPI = {
  // GET /admin/advertisements
  getAllAdvertisements: (page = 1, limit = 50, status = "all") => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status !== "all" && { status })
    });
    return adminApiRequest(`/advertisements?${queryParams}`);
  },

  // GET /admin/advertisements/:id
  getAdvertisementById: (adId) => adminApiRequest(`/advertisements/${adId}`),

  // POST /admin/advertisements
  createAdvertisement: (adData) => {
    // Handle both FormData and regular object data
    if (adData instanceof FormData) {
      return adminApiRequest("/advertisements", {
        method: "POST",
        body: adData,
      });
    } else {
      return adminApiRequest("/advertisements", {
        method: "POST",
        body: JSON.stringify(adData),
      });
    }
  },

  // PUT /admin/advertisements/:id
  updateAdvertisement: (adId, adData) => {
    // Handle both FormData and regular object data
    if (adData instanceof FormData) {
      return adminApiRequest(`/advertisements/${adId}`, {
        method: "PUT",
        body: adData,
      });
    } else {
      return adminApiRequest(`/advertisements/${adId}`, {
        method: "PUT",
        body: JSON.stringify(adData),
      });
    }
  },

  // DELETE /admin/advertisements/:id
  deleteAdvertisement: (adId) =>
    adminApiRequest(`/advertisements/${adId}`, {
      method: "DELETE",
    }),

  // Additional methods for future backend implementation
  getAdvertisementStats: () => adminApiRequest("/advertisements/stats"),
  toggleAdvertisementStatus: (adId) =>
    adminApiRequest(`/advertisements/${adId}/toggle-status`, {
      method: "PATCH",
    }),
};

// Community Management API methods (for future implementation)
export const adminCommunityAPI = {
  getAllPosts: (page = 1, limit = 50, status = "all") => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status !== "all" && { status })
    });
    return adminApiRequest(`/community/posts?${queryParams}`);
  },

  getPostById: (postId) => adminApiRequest(`/community/posts/${postId}`),

  updatePost: (postId, postData) =>
    adminApiRequest(`/community/posts/${postId}`, {
      method: "PUT",
      body: JSON.stringify(postData),
    }),

  deletePost: (postId) =>
    adminApiRequest(`/community/posts/${postId}`, {
      method: "DELETE",
    }),

  getPostComments: (postId) => adminApiRequest(`/community/posts/${postId}/comments`),

  deleteComment: (postId, commentId) =>
    adminApiRequest(`/community/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
    }),

  getCommunityStats: () => adminApiRequest("/community/stats"),

  moderatePost: (postId, action, reason = "") =>
    adminApiRequest(`/community/posts/${postId}/moderate`, {
      method: "POST",
      body: JSON.stringify({ action, reason }),
    }),
};

// Statistics and Analytics API methods (for future implementation)
export const adminStatsAPI = {
  getDashboardStats: () => adminApiRequest("/stats/dashboard"),

  getUserAnalytics: (period = "month") =>
    adminApiRequest(`/stats/users?period=${period}`),

  getAdvertisementAnalytics: (period = "month") =>
    adminApiRequest(`/stats/advertisements?period=${period}`),

  getCommunityAnalytics: (period = "month") =>
    adminApiRequest(`/stats/community?period=${period}`),

  getRevenueAnalytics: (period = "month") =>
    adminApiRequest(`/stats/revenue?period=${period}`),

  getSystemHealth: () => adminApiRequest("/stats/system-health"),

  exportAnalytics: (type, format = "csv", period = "month") => {
    const queryParams = new URLSearchParams({
      format,
      period,
    });
    return adminApiRequest(`/stats/export/${type}?${queryParams}`);
  },
};

// System Management API methods (for future implementation)
export const adminSystemAPI = {
  getSystemInfo: () => adminApiRequest("/system/info"),

  getSystemLogs: (page = 1, limit = 100, level = "all") => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(level !== "all" && { level })
    });
    return adminApiRequest(`/system/logs?${queryParams}`);
  },

  clearLogs: (level = "all") =>
    adminApiRequest("/system/logs/clear", {
      method: "POST",
      body: JSON.stringify({ level }),
    }),

  backupDatabase: () =>
    adminApiRequest("/system/backup", {
      method: "POST",
    }),

  getBackups: () => adminApiRequest("/system/backups"),

  restoreBackup: (backupId) =>
    adminApiRequest(`/system/backups/${backupId}/restore`, {
      method: "POST",
    }),

  updateSystemSettings: (settings) =>
    adminApiRequest("/system/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    }),

  getSystemSettings: () => adminApiRequest("/system/settings"),
};

// Reports API methods (for future implementation)
export const adminReportsAPI = {
  generateUserReport: (filters = {}) =>
    adminApiRequest("/reports/users", {
      method: "POST",
      body: JSON.stringify(filters),
    }),

  generateFinancialReport: (filters = {}) =>
    adminApiRequest("/reports/financial", {
      method: "POST",
      body: JSON.stringify(filters),
    }),

  generateActivityReport: (filters = {}) =>
    adminApiRequest("/reports/activity", {
      method: "POST",
      body: JSON.stringify(filters),
    }),

  getReportHistory: () => adminApiRequest("/reports/history"),

  downloadReport: (reportId) => adminApiRequest(`/reports/${reportId}/download`),

  deleteReport: (reportId) =>
    adminApiRequest(`/reports/${reportId}`, {
      method: "DELETE",
    }),
};

// Notification Management API methods (for future implementation)
export const adminNotificationAPI = {
  getAllNotifications: (page = 1, limit = 50) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return adminApiRequest(`/notifications?${queryParams}`);
  },

  sendNotification: (notificationData) =>
    adminApiRequest("/notifications", {
      method: "POST",
      body: JSON.stringify(notificationData),
    }),

  sendBulkNotification: (notificationData) =>
    adminApiRequest("/notifications/bulk", {
      method: "POST",
      body: JSON.stringify(notificationData),
    }),

  updateNotification: (notificationId, notificationData) =>
    adminApiRequest(`/notifications/${notificationId}`, {
      method: "PUT",
      body: JSON.stringify(notificationData),
    }),

  deleteNotification: (notificationId) =>
    adminApiRequest(`/notifications/${notificationId}`, {
      method: "DELETE",
    }),

  getNotificationTemplates: () => adminApiRequest("/notifications/templates"),

  createTemplate: (templateData) =>
    adminApiRequest("/notifications/templates", {
      method: "POST",
      body: JSON.stringify(templateData),
    }),
};

// Content Management API methods (for future implementation)
export const adminContentAPI = {
  getPages: () => adminApiRequest("/content/pages"),

  getPageById: (pageId) => adminApiRequest(`/content/pages/${pageId}`),

  updatePage: (pageId, pageData) =>
    adminApiRequest(`/content/pages/${pageId}`, {
      method: "PUT",
      body: JSON.stringify(pageData),
    }),

  getSettings: () => adminApiRequest("/content/settings"),

  updateSettings: (settings) =>
    adminApiRequest("/content/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    }),

  uploadMedia: (formData) =>
    adminApiRequest("/content/media", {
      method: "POST",
      body: formData,
    }),

  getMedia: (page = 1, limit = 50) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return adminApiRequest(`/content/media?${queryParams}`);
  },

  deleteMedia: (mediaId) =>
    adminApiRequest(`/content/media/${mediaId}`, {
      method: "DELETE",
    }),
};

// Main admin API object
export const adminAPI = {
  auth: adminAuthAPI,
  users: adminUserAPI,
  advertisements: adminAdvertisementAPI,
  community: adminCommunityAPI,
  stats: adminStatsAPI,
  system: adminSystemAPI,
  reports: adminReportsAPI,
  notifications: adminNotificationAPI,
  content: adminContentAPI,
};

export default adminApiRequest;