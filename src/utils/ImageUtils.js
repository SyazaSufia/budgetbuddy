// Get the base URL for static files (without /api prefix)
export const getStaticBaseUrl = () => {
  const isDevelopment = 
    process.env.NODE_ENV === "development" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  
  if (isDevelopment) {
    return "http://localhost:43210";
  }
  
  return `${window.location.protocol}//${window.location.host}`;
};

// Get the API base URL (with /api prefix for API calls)
export const getApiBaseUrl = () => {
  const isDevelopment = 
    process.env.NODE_ENV === "development" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  
  if (isDevelopment) {
    return "http://localhost:43210";
  }
  
  return `${window.location.protocol}//${window.location.host}/api`;
};

// Convert a relative image path to a full URL for display
export const getImageUrl = (imagePath) => {
  console.log(`[ImageUtils] Processing imagePath: ${imagePath}`);
  
  if (!imagePath) {
    console.log(`[ImageUtils] No image path provided`);
    return null;
  }
  
  // If it's already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log(`[ImageUtils] Already full URL: ${imagePath}`);
    return imagePath;
  }
  
  // If it's a data URL (base64), return as-is
  if (imagePath.startsWith('data:')) {
    console.log(`[ImageUtils] Data URL detected`);
    return imagePath;
  }
  
  // For relative paths, construct the full URL
  const staticBaseUrl = getStaticBaseUrl();
  
  // Clean the path
  let cleanPath = imagePath;
  
  // Remove leading slash if present
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }
  
  // Ensure proper path structure
  let finalPath;
  if (cleanPath.includes('uploads/ads/')) {
    // Path already contains the full structure
    finalPath = cleanPath;
  } else if (cleanPath.includes('uploads/')) {
    // Path contains uploads but not ads - this might be an old format
    const filename = cleanPath.split('/').pop();
    finalPath = `uploads/ads/${filename}`;
  } else {
    // Just a filename - assume it's an ad image
    finalPath = `uploads/ads/${cleanPath}`;
  }
  
  const fullUrl = `${staticBaseUrl}/${finalPath}`;
  console.log(`[ImageUtils] Final URL: ${fullUrl}`);
  
  return fullUrl;
};

// Truncate text to a specified length
export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid date';
  }
};

// Check if a file is an image based on extension
export const isImageFile = (filename) => {
  if (!filename) return false;
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  
  return imageExtensions.includes(extension);
};

// Get file size in human readable format
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Validate image file before upload
export const validateImageFile = (file) => {
  const errors = [];
  
  // Check file type
  if (!file.type.startsWith('image/')) {
    errors.push('File must be an image');
  }
  
  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    errors.push('File size must be less than 5MB');
  }
  
  // Check allowed extensions
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('File type not supported. Use JPG, PNG, GIF, or WebP');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Create a preview URL for a file
export const createPreviewUrl = (file) => {
  if (!file) return null;
  
  try {
    return URL.createObjectURL(file);
  } catch (error) {
    console.error('Error creating preview URL:', error);
    return null;
  }
};

// Clean up preview URL to prevent memory leaks
export const revokePreviewUrl = (url) => {
  if (url && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error revoking preview URL:', error);
    }
  }
};

// Base64 placeholder image for broken/missing images
export const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60' viewBox='0 0 80 60'%3E%3Crect width='80' height='60' fill='%23f3f4f6'/%3E%3Crect x='2' y='2' width='76' height='56' fill='%23f9fafb' rx='3' ry='3' stroke='%23e5e7eb' stroke-width='1'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='9' text-anchor='middle' dominant-baseline='middle' fill='%23a1a1aa'%3ENo Image%3C/text%3E%3C/svg%3E";

// Large placeholder for banner/modal views
export const LARGE_PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='100' viewBox='0 0 300 100'%3E%3Crect width='300' height='100' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='18' text-anchor='middle' dominant-baseline='middle' fill='%23666666'%3EAdvertisement%3C/text%3E%3C/svg%3E";

export default {
  getStaticBaseUrl,
  getApiBaseUrl,
  getImageUrl,
  truncateText,
  formatDate,
  isImageFile,
  formatFileSize,
  validateImageFile,
  createPreviewUrl,
  revokePreviewUrl,
  PLACEHOLDER_IMAGE,
  LARGE_PLACEHOLDER_IMAGE
};