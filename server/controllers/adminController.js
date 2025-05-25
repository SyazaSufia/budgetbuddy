const db = require('../db');
const path = require("path");
const fs = require("fs");

// Configuration object for file paths - centralized configuration
const CONFIG = {
  UPLOAD_DIRS: {
    ADS: 'uploads/ads',
    USERS: 'uploads/users',
    GENERAL: 'uploads'
  },
  FILE_LIMITS: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: /jpeg|jpg|png|gif|webp/
  },
  DEFAULT_POSITION: 'banner'
};

// Utility functions for file operations
const FileUtils = {
  // Get absolute path for uploads
  getUploadPath: (subDir = '') => {
    return path.join(process.cwd(), 'public', subDir);
  },

  // Get relative URL path for database storage
  getUrlPath: (subDir, filename) => {
    return `/${subDir}/${filename}`;
  },

  // Ensure directory exists
  ensureDirectoryExists: (dirPath) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  },

  // Delete file if exists
  deleteFileIfExists: (filePath) => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Error deleting file:', error.message);
      return false;
    }
  },

  // Convert relative URL to absolute file path
  urlToFilePath: (relativeUrl) => {
    if (!relativeUrl) return null;
    return path.join(process.cwd(), 'public', relativeUrl);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const results = await db.query("SELECT * FROM user");
    res.json({ success: true, data: results });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  const userId = req.params.id;
  console.log("Delete request received for user ID:", userId);

  try {
    // Check if user exists first
    const userExistsQuery = `SELECT userID FROM user WHERE userID = ?`;
    const [userExists] = await db.query(userExistsQuery, [userId]);
    
    if (!userExists) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Start a transaction
    await db.query('START TRANSACTION');

    try {
      // Method 1: Disable foreign key checks temporarily (safest approach)
      await db.query('SET FOREIGN_KEY_CHECKS = 0');
      
      // Delete all income records for this user (regardless of hierarchy)
      const deleteAllIncomeQuery = `DELETE FROM income WHERE userID = ?`;
      const incomeResult = await db.query(deleteAllIncomeQuery, [userId]);
      console.log(`Deleted ${incomeResult.affectedRows} income records`);
      
      // Re-enable foreign key checks
      await db.query('SET FOREIGN_KEY_CHECKS = 1');

      // Delete other related tables
      const tablesToClean = [
        'expenses',
        'budgets', 
        'categories',
        'income',
        'community_posts',
        'community_comments',
        'post_likes'
      ];

      for (const table of tablesToClean) {
        try {
          const deleteQuery = `DELETE FROM ${table} WHERE userID = ?`;
          const result = await db.query(deleteQuery, [userId]);
          console.log(`Deleted ${result.affectedRows} records from ${table}`);
        } catch (tableError) {
          // Skip tables that don't exist or don't have userID column
          if (tableError.code !== 'ER_NO_SUCH_TABLE' && tableError.code !== 'ER_BAD_FIELD_ERROR') {
            console.warn(`Error deleting from ${table}:`, tableError.message);
          } else {
            console.log(`Skipping ${table} (table doesn't exist or no userID column)`);
          }
        }
      }

      // Finally delete the user
      const deleteUserQuery = `DELETE FROM user WHERE userID = ?`;
      const userResult = await db.query(deleteUserQuery, [userId]);

      if (userResult.affectedRows === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ 
          success: false, 
          message: "Failed to delete user" 
        });
      }

      // Commit the transaction
      await db.query('COMMIT');
      console.log(`User ${userId} and all related data deleted successfully`);

      res.json({ 
        success: true, 
        message: "User and all related data deleted successfully" 
      });

    } catch (error) {
      // Make sure to re-enable foreign key checks even on error
      try {
        await db.query('SET FOREIGN_KEY_CHECKS = 1');
      } catch (fkError) {
        console.error("Error re-enabling foreign key checks:", fkError);
      }
      
      // Rollback the transaction
      await db.query('ROLLBACK');
      console.error("Transaction error:", error);
      throw error;
    }

  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete user: " + err.message 
    });
  }
};

// Alternative method: Recursive deletion (if you prefer not to disable FK checks)
const deleteUserRecursive = async (req, res) => {
  const userId = req.params.id;
  console.log("Delete request received for user ID (recursive method):", userId);

  try {
    // Check if user exists first
    const userExistsQuery = `SELECT userID FROM user WHERE userID = ?`;
    const [userExists] = await db.query(userExistsQuery, [userId]);
    
    if (!userExists) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Start a transaction
    await db.query('START TRANSACTION');

    try {
      // Step 1: Get all income records for this user and build a deletion order
      const getAllIncomeQuery = `
        SELECT incomeID, parentIncomeID 
        FROM income 
        WHERE userID = ? 
        ORDER BY parentIncomeID DESC, incomeID ASC
      `;
      const allIncome = await db.query(getAllIncomeQuery, [userId]);
      
      if (allIncome.length > 0) {
        // Create a map to track parent-child relationships
        const incomeMap = new Map();
        const rootIncomes = [];
        const childIncomes = [];
        
        allIncome.forEach(income => {
          incomeMap.set(income.incomeID, income);
          if (income.parentIncomeID === null) {
            rootIncomes.push(income);
          } else {
            childIncomes.push(income);
          }
        });
        
        // Delete children first, then parents
        // Sort children by depth (deepest first)
        const sortedChildren = [...childIncomes].sort((a, b) => {
          // Simple heuristic: assume higher IDs are deeper in hierarchy
          return b.incomeID - a.incomeID;
        });
        
        // Delete all children first
        for (const child of sortedChildren) {
          try {
            const deleteChildQuery = `DELETE FROM income WHERE incomeID = ? AND userID = ?`;
            await db.query(deleteChildQuery, [child.incomeID, userId]);
            console.log(`Deleted child income ${child.incomeID}`);
          } catch (childError) {
            console.warn(`Could not delete child income ${child.incomeID}:`, childError.message);
          }
        }
        
        // Then delete all parents
        for (const parent of rootIncomes) {
          try {
            const deleteParentQuery = `DELETE FROM income WHERE incomeID = ? AND userID = ?`;
            await db.query(deleteParentQuery, [parent.incomeID, userId]);
            console.log(`Deleted parent income ${parent.incomeID}`);
          } catch (parentError) {
            console.warn(`Could not delete parent income ${parent.incomeID}:`, parentError.message);
          }
        }
        
        // Final cleanup: delete any remaining income records
        const deleteRemainingQuery = `DELETE FROM income WHERE userID = ?`;
        const remainingResult = await db.query(deleteRemainingQuery, [userId]);
        if (remainingResult.affectedRows > 0) {
          console.log(`Deleted ${remainingResult.affectedRows} remaining income records`);
        }
      }

      // Delete other related tables (same as before)
      const tablesToClean = ['expenses', 'budgets', 'categories', 'income','community_posts','community_comments', 'post_likes'];

      for (const table of tablesToClean) {
        try {
          const deleteQuery = `DELETE FROM ${table} WHERE userID = ?`;
          const result = await db.query(deleteQuery, [userId]);
          console.log(`Deleted ${result.affectedRows} records from ${table}`);
        } catch (tableError) {
          if (tableError.code !== 'ER_NO_SUCH_TABLE' && tableError.code !== 'ER_BAD_FIELD_ERROR') {
            console.warn(`Error deleting from ${table}:`, tableError.message);
          }
        }
      }

      // Finally delete the user
      const deleteUserQuery = `DELETE FROM user WHERE userID = ?`;
      const userResult = await db.query(deleteUserQuery, [userId]);

      if (userResult.affectedRows === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({ 
          success: false, 
          message: "Failed to delete user" 
        });
      }

      // Commit the transaction
      await db.query('COMMIT');
      console.log(`User ${userId} and all related data deleted successfully (recursive method)`);

      res.json({ 
        success: true, 
        message: "User and all related data deleted successfully" 
      });

    } catch (error) {
      // Rollback the transaction
      await db.query('ROLLBACK');
      console.error("Transaction error:", error);
      throw error;
    }

  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete user: " + err.message 
    });
  }
};

// Get all advertisements
const getAllAdvertisements = async (req, res) => {
  try {
    const query = `
      SELECT * FROM advertisements
      ORDER BY createdAt DESC
    `;
    const advertisements = await db.query(query);
    res.json({ success: true, data: advertisements });
  } catch (error) {
    console.error("Error fetching advertisements:", error);
    res.status(500).json({ success: false, error: "Failed to fetch advertisements" });
  }
};

// Create a new advertisement
const createAdvertisement = async (req, res) => {
  try {
    const { title, description, linkURL, startDate, endDate } = req.body;
    
    // Fix: Convert string 'true'/'false' to boolean integer (1/0)
    const isActive = req.body.isActive === 'true' ? 1 : 0;
    
    let imageURL = null;
    
    // Handle image upload if file exists
    if (req.file) {
      imageURL = FileUtils.getUrlPath(CONFIG.UPLOAD_DIRS.ADS, req.file.filename);
    }
    
    const insertQuery = `
      INSERT INTO advertisements (
        title, description, imageURL, linkURL, 
        startDate, endDate, position, isActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await db.query(insertQuery, [
      title, 
      description, 
      imageURL, 
      linkURL, 
      startDate, 
      endDate, 
      CONFIG.DEFAULT_POSITION, // Use config instead of hardcoded 'banner'
      isActive
    ]);
    
    if (result.affectedRows > 0) {
      res.status(201).json({ 
        success: true, 
        message: "Advertisement created successfully",
        data: { adID: result.insertId }
      });
    } else {
      res.status(400).json({ success: false, error: "Failed to create advertisement" });
    }
  } catch (error) {
    console.error("Error creating advertisement:", error);
    res.status(500).json({ success: false, error: "Failed to create advertisement" });
  }
};

// Update an advertisement
const updateAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, linkURL, startDate, endDate } = req.body;
    
    // Fix: Convert string 'true'/'false' to boolean integer (1/0)
    const isActive = req.body.isActive === 'true' ? 1 : 0;
    
    // First, check if the ad exists
    const checkQuery = "SELECT * FROM advertisements WHERE adID = ?";
    const existingAds = await db.query(checkQuery, [id]);
    
    if (existingAds.length === 0) {
      return res.status(404).json({ success: false, error: "Advertisement not found" });
    }
    
    const existingAd = existingAds[0];
    let imageURL = existingAd.imageURL;
    
    // Handle image upload if file exists
    if (req.file) {
      // Delete old image if exists
      if (existingAd.imageURL) {
        const oldImagePath = FileUtils.urlToFilePath(existingAd.imageURL);
        if (oldImagePath) {
          FileUtils.deleteFileIfExists(oldImagePath);
        }
      }
      imageURL = FileUtils.getUrlPath(CONFIG.UPLOAD_DIRS.ADS, req.file.filename);
    }
    
    const updateQuery = `
      UPDATE advertisements
      SET 
        title = ?,
        description = ?,
        imageURL = ?,
        linkURL = ?,
        startDate = ?,
        endDate = ?,
        position = ?,
        isActive = ?
      WHERE adID = ?
    `;
    
    const result = await db.query(updateQuery, [
      title,
      description,
      imageURL,
      linkURL,
      startDate,
      endDate,
      CONFIG.DEFAULT_POSITION, // Use config instead of hardcoded 'banner'
      isActive,
      id
    ]);
    
    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Advertisement updated successfully" });
    } else {
      res.status(400).json({ success: false, error: "Failed to update advertisement" });
    }
  } catch (error) {
    console.error("Error updating advertisement:", error);
    res.status(500).json({ success: false, error: "Failed to update advertisement" });
  }
};

// Delete an advertisement
const deleteAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, check if the ad exists and get image path if any
    const checkQuery = "SELECT imageURL FROM advertisements WHERE adID = ?";
    const ads = await db.query(checkQuery, [id]);
    
    if (ads.length === 0) {
      return res.status(404).json({ success: false, error: "Advertisement not found" });
    }
    
    // Delete the advertisement from database
    const deleteQuery = "DELETE FROM advertisements WHERE adID = ?";
    const result = await db.query(deleteQuery, [id]);
    
    if (result.affectedRows > 0) {
      // Delete the image file if it exists
      if (ads[0].imageURL) {
        const imagePath = FileUtils.urlToFilePath(ads[0].imageURL);
        if (imagePath) {
          FileUtils.deleteFileIfExists(imagePath);
        }
      }
      
      res.json({ success: true, message: "Advertisement deleted successfully" });
    } else {
      res.status(400).json({ success: false, error: "Failed to delete advertisement" });
    }
  } catch (error) {
    console.error("Error deleting advertisement:", error);
    res.status(500).json({ success: false, error: "Failed to delete advertisement" });
  }
};

// Get a single advertisement by ID
const getAdvertisementById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = "SELECT * FROM advertisements WHERE adID = ?";
    const ads = await db.query(query, [id]);
    
    if (ads.length > 0) {
      res.json({ success: true, data: ads[0] });
    } else {
      res.status(404).json({ success: false, error: "Advertisement not found" });
    }
  } catch (error) {
    console.error("Error fetching advertisement:", error);
    res.status(500).json({ success: false, error: "Failed to fetch advertisement" });
  }
};

// Export configuration and utilities for use in other modules
module.exports = {
  getAllUsers,
  deleteUser, // Uses the FK disable method
  deleteUserRecursive, // Alternative recursive method
  getAllAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  getAdvertisementById,
  // Export utilities and config for reuse
  CONFIG,
  FileUtils
};