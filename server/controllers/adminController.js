const db = require('../db');

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

module.exports = {
  getAllUsers,
  deleteUser,
};
