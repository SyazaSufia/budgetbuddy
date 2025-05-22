/**
 * Utility functions for handling URLs and other common tasks
 */

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
  
  // Use import.meta.env for Vite projects
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:43210';
  
  // Ensure the path starts with a slash
  const normalizedPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  
  const fullUrl = `${apiBaseUrl}${normalizedPath}`;
  console.log('Constructed image URL:', fullUrl); // Debug log
  
  return fullUrl;
};

/**
 * Gets the base API URL from environment variables
 * @returns {string} The base API URL
 */
export const getApiBaseUrl = () => {
  // Use import.meta.env for Vite projects
  return import.meta.env.VITE_API_URL || 'http://localhost:43210';
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
 * Truncates text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length 
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};