const db = require("../db");
const bcrypt = require("bcrypt");

const saltRounds = 10;

// Sign-up endpoint
const signUp = async (req, res) => {
  try {
    const { userName, userEmail, userPassword, userDOB } = req.body;

    if (!userName || !userEmail || !userPassword || !userDOB) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    // Check if email exists
    const existingUsers = await db.query("SELECT * FROM user WHERE userEmail = ?", [userEmail]);
    
    if (existingUsers.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists." });
    }

    // Hash password
    const hash = await bcrypt.hash(userPassword, saltRounds);
    
    // Insert user
    await db.query(
      'INSERT INTO user (userName, userEmail, userPassword, userDOB) VALUES (?, ?, ?, STR_TO_DATE(?, "%Y-%m-%d"))',
      [userName, userEmail, hash, userDOB]
    );
    
    return res
      .status(201)
      .json({ success: true, message: "User registered successfully." });
      
  } catch (error) {
    console.error("Error in sign-up:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error during registration." });
  }
};

module.exports = {
  signUp
};