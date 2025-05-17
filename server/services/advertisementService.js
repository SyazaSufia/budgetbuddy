// services/advertisementService.js

const API_URL = "http://localhost:8080/admin";

/**
 * Service for managing advertisements
 */
const advertisementService = {
  /**
   * Get all advertisements
   * @returns {Promise<Object>} Response with advertisements data
   */
  getAllAdvertisements: async () => {
    try {
      const response = await fetch(`${API_URL}/advertisements`, {
        credentials: "include"
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch advertisements");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching advertisements:", error);
      throw error;
    }
  },
  
  /**
   * Get advertisement by ID
   * @param {number} id Advertisement ID
   * @returns {Promise<Object>} Response with advertisement data
   */
  getAdvertisementById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/advertisements/${id}`, {
        credentials: "include"
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch advertisement");
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching advertisement ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new advertisement
   * @param {FormData} formData Form data with advertisement details
   * @returns {Promise<Object>} Response with created advertisement data
   */
  createAdvertisement: async (formData) => {
    try {
      const response = await fetch(`${API_URL}/advertisements`, {
        method: "POST",
        credentials: "include",
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create advertisement");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error creating advertisement:", error);
      throw error;
    }
  },
  
  /**
   * Update an existing advertisement
   * @param {number} id Advertisement ID
   * @param {FormData} formData Form data with updated advertisement details
   * @returns {Promise<Object>} Response with updated advertisement data
   */
  updateAdvertisement: async (id, formData) => {
    try {
      const response = await fetch(`${API_URL}/advertisements/${id}`, {
        method: "PUT",
        credentials: "include",
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update advertisement");
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating advertisement ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete an advertisement
   * @param {number} id Advertisement ID
   * @returns {Promise<Object>} Response with deletion status
   */
  deleteAdvertisement: async (id) => {
    try {
      const response = await fetch(`${API_URL}/advertisements/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete advertisement");
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error deleting advertisement ${id}:`, error);
      throw error;
    }
  }
};

export default advertisementService;