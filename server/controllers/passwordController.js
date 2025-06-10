const db = require("../db");
const bcrypt = require('bcrypt');

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Validation checks
    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email and new password are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Validate password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check if user exists
    const [rows] = await db.query(
      'SELECT userID, userEmail FROM user WHERE userEmail = ?', 
      [email]
    );

    // Check if we got any results
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    // Get the user from the results
    const user = rows[0];

    // Hash and update the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await db.query(
      'UPDATE user SET userPassword = ? WHERE userEmail = ?', 
      [hashedPassword, email]
    );

    // Log password reset
    const logQuery = `
      INSERT INTO password_reset_logs (userID, ip_address, user_agent, status) 
      VALUES (?, ?, ?, 'success')
    `;
    const userIp = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Make sure we have a valid userID before logging
    if (user && user.userID) {
      await db.query(logQuery, [user.userID, userIp, userAgent]);
    }

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while resetting password'
    });
  }
};

module.exports = {
  resetPassword
};