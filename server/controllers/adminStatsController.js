const db = require('../db');

// Get income type statistics
const getIncomeTypeStats = async (req, res) => {
  try {
    const query = `
      SELECT incomeType, COUNT(*) as count
      FROM user
      WHERE incomeType IS NOT NULL
      GROUP BY incomeType
      ORDER BY count DESC
    `;
    
    const stats = await db.query(query);
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching income type statistics:", error);
    res.status(500).json({ success: false, error: "Failed to fetch income type statistics" });
  }
};

// Get scholarship type statistics
const getScholarshipTypeStats = async (req, res) => {
  try {
    const query = `
      SELECT scholarshipType, COUNT(*) as count
      FROM user
      WHERE scholarshipType IS NOT NULL
      GROUP BY scholarshipType
      ORDER BY count DESC
    `;
    
    const stats = await db.query(query);
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching scholarship type statistics:", error);
    res.status(500).json({ success: false, error: "Failed to fetch scholarship type statistics" });
  }
};

// Get all statistics in one call (for dashboard)
const getAllStats = async (req, res) => {
  try {
    // Income type statistics
    const incomeQuery = `
      SELECT incomeType, COUNT(*) as count
      FROM user
      WHERE incomeType IS NOT NULL
      GROUP BY incomeType
      ORDER BY count DESC
    `;
    
    // Scholarship type statistics
    const scholarshipQuery = `
      SELECT scholarshipType, COUNT(*) as count
      FROM user
      WHERE scholarshipType IS NOT NULL
      GROUP BY scholarshipType
      ORDER BY count DESC
    `;
    
    // Total users count
    const totalUsersQuery = `SELECT COUNT(*) as totalUsers FROM user`;
    
    const incomeStats = await db.query(incomeQuery);
    const scholarshipStats = await db.query(scholarshipQuery);
    const totalUsersResult = await db.query(totalUsersQuery);
    
    res.json({ 
      success: true, 
      data: {
        incomeStats,
        scholarshipStats,
        totalUsers: totalUsersResult[0].totalUsers
      }
    });
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    res.status(500).json({ success: false, error: "Failed to fetch user statistics" });
  }
};

module.exports = {
  getIncomeTypeStats,
  getScholarshipTypeStats,
  getAllStats
};