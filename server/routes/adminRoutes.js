// controllers/adminController.js
const db = require('../db');

const getAllUsers = (req, res) => {
  db.query("SELECT * FROM user", (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
    res.json({ success: true, data: results });
  });
};

module.exports = {
  getAllUsers,
};
