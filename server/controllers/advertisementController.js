const db = require("../db");

/**
 * Helper function to determine if we're in development
 */
const isDevelopment = () => process.env.NODE_ENV === "development";

/**
 * Get the base URL for the server (WITHOUT /api for static files)
 */
const getBaseUrl = (req) => {
  if (isDevelopment()) {
    return "http://localhost:43210";
  }
  // For production, use the same protocol and host as the request
  return `${req.protocol}://${req.get("host")}`;
};

/**
 * Process image URLs to ensure they are properly formed
 */
const processImageURL = (imageURL, req) => {
  if (!imageURL) return null;
  
  // If already a full URL, return as-is
  if (imageURL.startsWith('http://') || imageURL.startsWith('https://')) {
    return imageURL;
  }
  
  const baseUrl = getBaseUrl(req);
  
  // Remove leading slash if present
  const cleanPath = imageURL.startsWith('/') ? imageURL.substring(1) : imageURL;
  
  // Add uploads prefix if not present
  const path = cleanPath.includes('uploads/') ? cleanPath : `uploads/${cleanPath}`;
  
  return `${baseUrl}/${path}`;
};

/**
 * Get active advertisements for user-facing pages
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getActiveAdvertisements = async (req, res) => {
  try {
    const { limit } = req.query;
    const today = new Date().toISOString().split("T")[0];

    let query = `
      SELECT adID, title, description, imageURL, linkURL, position
      FROM advertisements
      WHERE isActive = 1
      AND (startDate IS NULL OR startDate <= ?)
      AND (endDate IS NULL OR endDate >= ?)
    `;

    const params = [today, today];

    // Add limit if provided
    if (limit) {
      query += ` ORDER BY RAND() LIMIT ?`; // Random selection with limit
      params.push(parseInt(limit));
    } else {
      query += ` ORDER BY RAND()`; // Random selection without limit
    }

    const advertisements = await db.query(query, params);

    // Process image URLs to ensure they are properly formed
    const processedAds = advertisements.map((ad) => {
      return {
        ...ad,
        imageURL: processImageURL(ad.imageURL, req)
      };
    });

    // Format response to match your existing pattern
    res.json({
      success: true,
      data: processedAds,
    });
  } catch (error) {
    console.error("Error fetching active advertisements:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch advertisements",
    });
  }
};

/**
 * Administrative function to create a new advertisement
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createAdvertisement = async (req, res) => {
  try {
    const {
      title,
      description,
      imageURL,
      linkURL,
      position,
      isActive,
      startDate,
      endDate,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: "Advertisement title is required",
      });
    }

    const query = `
      INSERT INTO advertisements 
      (title, description, imageURL, linkURL, position, isActive, startDate, endDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      title,
      description || null,
      imageURL || null,
      linkURL || null,
      position || null,
      isActive !== undefined ? isActive : 1,
      startDate || null,
      endDate || null,
    ];

    const result = await db.query(query, params);

    res.status(201).json({
      success: true,
      message: "Advertisement created successfully",
      data: { adID: result.insertId },
    });
  } catch (error) {
    console.error("Error creating advertisement:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create advertisement",
    });
  }
};

/**
 * Administrative function to get all advertisements
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllAdvertisements = async (req, res) => {
  try {
    const query = `
      SELECT 
        adID, 
        title, 
        description, 
        imageURL, 
        linkURL, 
        position, 
        isActive,
        startDate,
        endDate,
        createdAt,
        updatedAt
      FROM advertisements
      ORDER BY createdAt DESC
    `;

    const advertisements = await db.query(query);

    // Process image URLs for admin panel
    const processedAds = advertisements.map((ad) => {
      return {
        ...ad,
        imageURL: processImageURL(ad.imageURL, req)
      };
    });

    res.json({
      success: true,
      data: processedAds,
    });
  } catch (error) {
    console.error("Error fetching all advertisements:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch advertisements",
    });
  }
};

/**
 * Administrative function to update an advertisement
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateAdvertisement = async (req, res) => {
  try {
    const { adID } = req.params;
    const updateFields = req.body;

    if (!adID) {
      return res.status(400).json({
        success: false,
        error: "Advertisement ID is required",
      });
    }

    // Remove undefined fields
    const fieldsToUpdate = Object.keys(updateFields).filter(
      key => updateFields[key] !== undefined
    );

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields provided for update",
      });
    }

    // Build update query dynamically
    const setClause = fieldsToUpdate.map(field => `${field} = ?`).join(', ');
    const updateQuery = `UPDATE advertisements SET ${setClause} WHERE adID = ?`;
    const updateParams = [...fieldsToUpdate.map(field => updateFields[field]), adID];

    const result = await db.query(updateQuery, updateParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Advertisement not found",
      });
    }

    res.json({
      success: true,
      message: "Advertisement updated successfully",
    });
  } catch (error) {
    console.error("Error updating advertisement:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update advertisement",
    });
  }
};

/**
 * Administrative function to delete an advertisement
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteAdvertisement = async (req, res) => {
  try {
    const { adID } = req.params;

    if (!adID) {
      return res.status(400).json({
        success: false,
        error: "Advertisement ID is required",
      });
    }

    // Delete the advertisement directly - let the database handle if it exists
    const deleteQuery = "DELETE FROM advertisements WHERE adID = ?";
    const result = await db.query(deleteQuery, [adID]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Advertisement not found",
      });
    }

    res.json({
      success: true,
      message: "Advertisement deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting advertisement:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete advertisement",
    });
  }
};

module.exports = {
  getActiveAdvertisements,
  createAdvertisement,
  getAllAdvertisements,
  updateAdvertisement,
  deleteAdvertisement,
};