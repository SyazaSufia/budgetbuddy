// Import the API_BASE_URL from your adminAPI
import { API_BASE_URL } from '../services/AdminApi';

// Configuration object for utility constants - centralized configuration
const UTILS_CONFIG = {
  FILE_SIZE: {
    UNITS: ['Bytes', 'KB', 'MB', 'GB', 'TB'],
    MULTIPLIER: 1024
  },
  TEXT: {
    DEFAULT_TRUNCATE_LENGTH: 100,
    ELLIPSIS: '...'
  },
  STATUS_CLASSES: {
    ACTIVE: 'status-active',
    INACTIVE: 'status-inactive',
    SCHEDULED: 'status-scheduled',
    EXPIRED: 'status-expired'
  },
  STATUS_TEXT: {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    SCHEDULED: 'Scheduled',
    EXPIRED: 'Expired'
  }
};

// Image and URL utilities
const ImageUtils = {
  /**
   * Formats a relative image URL to a full URL with base path
   * @param {string} relativePath - The relative path of the image
   * @returns {string|null} The full URL or null if no path
   */
  getImageUrl: (relativePath) => {
    if (!relativePath) return null;
    
    // Check if the path already includes http/https
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    
    // Use the same API_BASE_URL as your adminAPI for consistency
    const apiBaseUrl = API_BASE_URL;
    
    // Ensure the path starts with a slash
    const normalizedPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    
    const fullUrl = `${apiBaseUrl}${normalizedPath}`;
    console.log('Constructed image URL:', fullUrl); // Debug log
    
    return fullUrl;
  },

  /**
   * Validate if an image URL is accessible
   * @param {string} imageUrl - Image URL to validate
   * @returns {Promise<boolean>} True if image is accessible
   */
  validateImageUrl: async (imageUrl) => {
    if (!imageUrl) return false;
    
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.warn('Image validation failed:', error.message);
      return false;
    }
  },

  /**
   * Get image dimensions from URL
   * @param {string} imageUrl - Image URL
   * @returns {Promise<{width: number, height: number}|null>} Image dimensions or null
   */
  getImageDimensions: (imageUrl) => {
    return new Promise((resolve) => {
      if (!imageUrl) {
        resolve(null);
        return;
      }

      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        console.warn('Failed to load image for dimensions:', imageUrl);
        resolve(null);
      };
      img.src = imageUrl;
    });
  }
};

// Date and time utilities
const DateUtils = {
  /**
   * Formats a date for display
   * @param {string|Date} dateInput - The date to format
   * @param {Object} options - Formatting options
   * @returns {string} Formatted date string
   */
  formatDate: (dateInput, options = {}) => {
    if (!dateInput) return "N/A";
    
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return "Invalid Date";
    
    const defaultOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    
    return date.toLocaleDateString(undefined, { ...defaultOptions, ...options });
  },

  /**
   * Formats a date for form input (YYYY-MM-DD format)
   * @param {string|Date} dateInput - The date to format
   * @returns {string} Formatted date string for form input
   */
  formatDateForInput: (dateInput) => {
    if (!dateInput) return "";
    
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return "";
    
    return date.toISOString().split('T')[0];
  },

  /**
   * Format date and time for display
   * @param {string|Date} dateInput - The date to format
   * @returns {string} Formatted date and time string
   */
  formatDateTime: (dateInput) => {
    if (!dateInput) return "N/A";
    
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    
    if (isNaN(date.getTime())) return "Invalid Date";
    
    return date.toLocaleString();
  },

  /**
   * Get relative time (e.g., "2 hours ago")
   * @param {string|Date} dateInput - The date to compare
   * @returns {string} Relative time string
   */
  getRelativeTime: (dateInput) => {
    if (!dateInput) return "Unknown";
    
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'second', seconds: 1 }
    ];
    
    for (const interval of intervals) {
      const count = Math.floor(diffInSeconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
      }
    }
    
    return 'just now';
  },

  /**
   * Check if a date is in the past
   * @param {string|Date} dateInput - Date to check
   * @returns {boolean} True if date is in the past
   */
  isPastDate: (dateInput) => {
    if (!dateInput) return false;
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return date < new Date();
  },

  /**
   * Check if a date is in the future
   * @param {string|Date} dateInput - Date to check
   * @returns {boolean} True if date is in the future
   */
  isFutureDate: (dateInput) => {
    if (!dateInput) return false;
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return date > new Date();
  }
};

// Text and string utilities
const TextUtils = {
  /**
   * Truncates text to specified length with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length 
   * @param {string} suffix - Suffix to add (default: '...')
   * @returns {string} Truncated text
   */
  truncateText: (text, maxLength = UTILS_CONFIG.TEXT.DEFAULT_TRUNCATE_LENGTH, suffix = UTILS_CONFIG.TEXT.ELLIPSIS) => {
    if (!text) return "";
    if (typeof text !== 'string') text = String(text);
    return text.length > maxLength ? `${text.substring(0, maxLength)}${suffix}` : text;
  },

  /**
   * Capitalize first letter of each word
   * @param {string} text - Text to capitalize
   * @returns {string} Capitalized text
   */
  capitalizeWords: (text) => {
    if (!text) return "";
    return text.replace(/\b\w/g, l => l.toUpperCase());
  },

  /**
   * Convert text to slug format (URL-friendly)
   * @param {string} text - Text to convert
   * @returns {string} Slug format text
   */
  textToSlug: (text) => {
    if (!text) return "";
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  /**
   * Extract plain text from HTML
   * @param {string} html - HTML string
   * @returns {string} Plain text
   */
  stripHtml: (html) => {
    if (!html) return "";
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }
};

// Advertisement status utilities
const AdStatusUtils = {
  /**
   * Get status color class based on advertisement status
   * @param {boolean} isActive - Advertisement active status
   * @param {string} startDate - Start date string
   * @param {string} endDate - End date string
   * @returns {string} CSS class name for status color
   */
  getAdStatusClass: (isActive, startDate, endDate) => {
    if (!isActive) return UTILS_CONFIG.STATUS_CLASSES.INACTIVE;
    
    const now = new Date();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (start && now < start) return UTILS_CONFIG.STATUS_CLASSES.SCHEDULED;
    if (end && now > end) return UTILS_CONFIG.STATUS_CLASSES.EXPIRED;
    return UTILS_CONFIG.STATUS_CLASSES.ACTIVE;
  },

  /**
   * Get human readable status text
   * @param {boolean} isActive - Advertisement active status
   * @param {string} startDate - Start date string
   * @param {string} endDate - End date string
   * @returns {string} Human readable status
   */
  getAdStatusText: (isActive, startDate, endDate) => {
    if (!isActive) return UTILS_CONFIG.STATUS_TEXT.INACTIVE;
    
    const now = new Date();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (start && now < start) return UTILS_CONFIG.STATUS_TEXT.SCHEDULED;
    if (end && now > end) return UTILS_CONFIG.STATUS_TEXT.EXPIRED;
    return UTILS_CONFIG.STATUS_TEXT.ACTIVE;
  },

  /**
   * Check if advertisement is currently active
   * @param {boolean} isActive - Advertisement active status
   * @param {string} startDate - Start date string
   * @param {string} endDate - End date string
   * @returns {boolean} True if currently active
   */
  isCurrentlyActive: (isActive, startDate, endDate) => {
    return AdStatusUtils.getAdStatusText(isActive, startDate, endDate) === UTILS_CONFIG.STATUS_TEXT.ACTIVE;
  }
};

// API utilities
const ApiUtils = {
  /**
   * Gets the base API URL (now consistent with adminAPI)
   * @returns {string} The base API URL
   */
  getApiBaseUrl: () => {
    return API_BASE_URL;
  },

  /**
   * Build query string from object
   * @param {Object} params - Parameters object
   * @returns {string} Query string
   */
  buildQueryString: (params) => {
    if (!params || typeof params !== 'object') return '';
    
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  },

  /**
   * Handle API error responses consistently
   * @param {Error} error - Error object
   * @param {string} context - Context where error occurred
   * @returns {string} User-friendly error message
   */
  handleApiError: (error, context = 'operation') => {
    console.error(`API Error in ${context}:`, error);
    
    if (error.message.includes('Failed to fetch')) {
      return 'Unable to connect to server. Please check your connection.';
    }
    
    if (error.message.includes('403')) {
      return 'You do not have permission to perform this action.';
    }
    
    if (error.message.includes('404')) {
      return 'The requested resource was not found.';
    }
    
    if (error.message.includes('500')) {
      return 'Server error occurred. Please try again later.';
    }
    
    return error.message || `An error occurred during ${context}`;
  }
};

// Legacy exports for backward compatibility
export const getImageUrl = ImageUtils.getImageUrl;
export const getApiBaseUrl = ApiUtils.getApiBaseUrl;
export const formatDate = DateUtils.formatDate;
export const formatDateForInput = DateUtils.formatDateForInput;
export const truncateText = TextUtils.truncateText;
export const getAdStatusClass = AdStatusUtils.getAdStatusClass;
export const getAdStatusText = AdStatusUtils.getAdStatusText;

// Modern organized exports
export {
  UTILS_CONFIG,
  ImageUtils,
  DateUtils,
  TextUtils,
  AdStatusUtils,
  ApiUtils
};

// Default export with all utilities
export default {
  config: UTILS_CONFIG,
  image: ImageUtils,
  date: DateUtils,
  text: TextUtils,
  adStatus: AdStatusUtils,
  api: ApiUtils
};