const db = require('../db');
const path = require("path");
const fs = require("fs");

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
    const result = await db.query("DELETE FROM user WHERE userID = ?", [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User successfully deleted" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ success: false, message: "Server error" });
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
      imageURL = `/uploads/ads/${req.file.filename}`;
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
      'banner', // Always set to "banner"
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
        const oldImagePath = path.join(__dirname, '../public', existingAd.imageURL);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imageURL = `/uploads/ads/${req.file.filename}`;
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
      'banner', // Always set to "banner"
      isActive, // Use our converted value
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
        const imagePath = path.join(__dirname, '../public', ads[0].imageURL);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
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

module.exports = {
  getAllUsers,
  deleteUser,
  getAllAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  getAdvertisementById
};