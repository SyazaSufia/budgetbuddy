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

const deleteUser = (req, res) => {
  const userId = req.params.id;
  console.log("Delete request received for user ID:", userId);

  db.query("DELETE FROM user WHERE userID = ?", [userId], (err, results) => {
    if (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User successfully deleted" });
  });
};

module.exports = {
  getAllUsers,
  deleteUser,
};

