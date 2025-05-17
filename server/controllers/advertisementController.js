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
    
    res.json({
      success: true,
      data: advertisements
    });
  } catch (error) {
    console.error("Error fetching active advertisements:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch advertisements"
    });
  }
};

module.exports = {
  getActiveAdvertisements
};