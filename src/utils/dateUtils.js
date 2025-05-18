import { formatDistanceToNow, parseISO, format } from 'date-fns';

/**
 * Formats a date as a relative time (e.g., "5 minutes ago")
 * With special handling for very recent posts
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted relative time
 */
export const formatRelativeTime = (dateString) => {
  try {
    const date = parseISO(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "recently";
    }
    
    // Handle very recent posts
    const diffMs = Date.now() - date.getTime();
    if (diffMs < 60000) {
      return "just now";
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (err) {
    console.error("Error formatting relative time:", err);
    return "recently";
  }
};

/**
 * Formats a date in a standard format (e.g., "January 1, 2023 12:30 PM")
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatStandardDate = (dateString) => {
  try {
    const date = parseISO(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    
    return format(date, "MMMM d, yyyy h:mm a");
  } catch (err) {
    console.error("Error formatting date:", err);
    return "Unknown date";
  }
};