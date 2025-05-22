// src/config/api.js
const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';

// Base API URL that adapts based on environment
export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:43210' 
  : 'https://budgetbuddy.space';

// Reusable fetch with credentials
export const fetchWithAuth = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    return response;
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
};