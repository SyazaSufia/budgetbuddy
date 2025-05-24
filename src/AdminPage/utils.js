// Import the API_BASE_URL from your adminAPI
import { API_BASE_URL } from '../services/AdminApi';

/**
 * Formats a relative image URL to a full URL with base path
 * @param {string} relativePath - The relative path of the image
 * @returns {string|null} The full URL or null if no path
 */
export const getImageUrl = (relativePath) => {
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
};

/**
 * Gets the base API URL (now consistent with adminAPI)
 * @returns {string} The base API URL
 */
export const getApiBaseUrl = () => {
  return API_BASE_URL;
};

/**
 * Formats a date for display
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

/**
 * Formats a date for form input (YYYY-MM-DD format)
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string for form input
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

/**
 * Truncates text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length 
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return "0 Bytes";
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate if a URL is properly formatted
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export const isValidUrl = (url) => {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get status color class based on advertisement status
 * @param {boolean} isActive - Advertisement active status
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {string} CSS class name for status color
 */
export const getAdStatusClass = (isActive, startDate, endDate) => {
  if (!isActive) return 'status-inactive';
  
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) return 'status-scheduled';
  if (now > end) return 'status-expired';
  return 'status-active';
};

/**
 * Get human readable status text
 * @param {boolean} isActive - Advertisement active status
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {string} Human readable status
 */
export const getAdStatusText = (isActive, startDate, endDate) => {
  if (!isActive) return 'Inactive';
  
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) return 'Scheduled';
  if (now > end) return 'Expired';
  return 'Active';
};