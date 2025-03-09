const db = require('../db');
const { sendResetEmail } = require('../services/emailService');
const crypto = require('crypto');

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Check if the user exists
  const userQuery = 'SELECT userID FROM user WHERE userEmail = ?';
  db.query(userQuery, [email], async (err, data) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ success: false, message: 'Database error', error: err });
    }

    if (data.length === 0) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }

    const userID = data[0].userID;
    const resetToken = crypto.randomBytes(32).toString('hex'); // Secure token
    const expiryTime = Date.now() + 3600000; // 1 hour expiry

    // Store token in the database
    const insertTokenQuery = `
      INSERT INTO password_reset (userID, token, expires_at) 
      VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token=?, expires_at=?`;

    db.query(insertTokenQuery, [userID, resetToken, expiryTime, resetToken, expiryTime], async (err) => {
      if (err) {
        console.error("Error saving token:", err); // Log the actual error
        return res.status(500).json({ success: false, message: 'Error saving token', error: err });
      }

      // Send reset email
      try {
        await sendResetEmail(email, resetToken);
        res.json({ success: true, message: 'Password reset email sent!' });
      } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ success: false, message: 'Failed to send email', error: error });
      }
    });
  });
};

exports.resetPassword = (req, res) => {
  const { token, password } = req.body;

  const checkTokenQuery = 'SELECT userID FROM password_reset WHERE token = ? AND expires_at > ?';
  db.query(checkTokenQuery, [token, Date.now()], (err, data) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    if (data.length === 0) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    const userID = data[0].userID;
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    const updatePasswordQuery = 'UPDATE user SET password = ? WHERE userID = ?';
    db.query(updatePasswordQuery, [hashedPassword, userID], (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Error updating password' });

      db.query('DELETE FROM password_reset WHERE userID = ?', [userID]);
      res.json({ success: true, message: 'Password reset successful!' });
    });
  });
};
