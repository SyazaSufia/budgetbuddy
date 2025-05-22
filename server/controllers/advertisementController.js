const db = require("../db");

/**
 * Get active advertisements for user-facing pages
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getActiveAdvertisements = async (req, res) => {
  try {
    const { limit } = req.query;
    const today = new Date().toISOString().split('T')[0];
    
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
    
    console.log("Executing query:", query);
    console.log("With params:", params);
    
    const advertisements = await db.query(query, params);
    
    console.log("Fetched advertisements:", advertisements);
    
    // Get the base URL for the server
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:43210';
    
    // Process image URLs to ensure they are properly formed
    const processedAds = advertisements.map(ad => {
      if (ad.imageURL && !ad.imageURL.startsWith('http')) {
        // Assuming imageURL is stored as a relative path to the public directory
        ad.imageURL = `${baseUrl}${ad.imageURL}`;
      }
      return ad;
    });
    
    // Format response to match your existing pattern
    res.json({
      success: true,
      data: processedAds
    });
  } catch (error) {
    console.error("Error fetching active advertisements:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch advertisements"
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
      endDate 
    } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: "Advertisement title is required"
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
      endDate || null
    ];
    
    const result = await db.query(query, params);
    
    res.status(201).json({
      success: true,
      message: "Advertisement created successfully",
      data: { adID: result.insertId }
    });
  } catch (error) {
    console.error("Error creating advertisement:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create advertisement"
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
    
    res.json({
      success: true,
      data: advertisements
    });
  } catch (error) {
    console.error("Error fetching all advertisements:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch advertisements"
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
    const { 
      title, 
      description, 
      imageURL, 
      linkURL, 
      position, 
      isActive, 
      startDate, 
      endDate 
    } = req.body;
    
    if (!adID) {
      return res.status(400).json({
        success: false,
        error: "Advertisement ID is required"
      });
    }
    
    // First, check if advertisement exists
    const checkQuery = "SELECT adID FROM advertisements WHERE adID = ?";
    const existingAd = await db.query(checkQuery, [adID]);
    
    if (existingAd.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Advertisement not found"
      });
    }
    
    // Build update query dynamically based on provided fields
    let updateQuery = "UPDATE advertisements SET ";
    let updateParams = [];
    
    if (title !== undefined) {
      updateQuery += "title = ?, ";
      updateParams.push(title);
    }
    
    if (description !== undefined) {
      updateQuery += "description = ?, ";
      updateParams.push(description);
    }
    
    if (imageURL !== undefined) {
      updateQuery += "imageURL = ?, ";
      updateParams.push(imageURL);
    }
    
    if (linkURL !== undefined) {
      updateQuery += "linkURL = ?, ";
      updateParams.push(linkURL);
    }
    
    if (position !== undefined) {
      updateQuery += "position = ?, ";
      updateParams.push(position);
    }
    
    if (isActive !== undefined) {
      updateQuery += "isActive = ?, ";
      updateParams.push(isActive);
    }
    
    if (startDate !== undefined) {
      updateQuery += "startDate = ?, ";
      updateParams.push(startDate);
    }
    
    if (endDate !== undefined) {
      updateQuery += "endDate = ?, ";
      updateParams.push(endDate);
    }
    
    // Remove trailing comma and space
    updateQuery = updateQuery.slice(0, -2);
    
    // Add WHERE clause
    updateQuery += " WHERE adID = ?";
    updateParams.push(adID);
    
    // Execute update if there are fields to update
    if (updateParams.length > 1) { // > 1 because at least one param is for the WHERE clause
      await db.query(updateQuery, updateParams);
      
      res.json({
        success: true,
        message: "Advertisement updated successfully"
      });
    } else {
      res.status(400).json({
        success: false,
        error: "No fields provided for update"
      });
    }
  } catch (error) {
    console.error("Error updating advertisement:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update advertisement"
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
        error: "Advertisement ID is required"
      });
    }
    
    // Check if advertisement exists
    const checkQuery = "SELECT adID FROM advertisements WHERE adID = ?";
    const existingAd = await db.query(checkQuery, [adID]);
    
    if (existingAd.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Advertisement not found"
      });
    }
    
    // Delete the advertisement
    const deleteQuery = "DELETE FROM advertisements WHERE adID = ?";
    await db.query(deleteQuery, [adID]);
    
    res.json({
      success: true,
      message: "Advertisement deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting advertisement:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete advertisement"
    });
  }
};

module.exports = {
  getActiveAdvertisements,
  createAdvertisement,
  getAllAdvertisements,
  updateAdvertisement,
  deleteAdvertisement
};