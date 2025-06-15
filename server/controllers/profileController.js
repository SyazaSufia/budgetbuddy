const db = require("../db");

// Get User Details Endpoint
const getUserDetails = async (req, res) => {
  try {
    const { id } = req.session.user;

    const users = await db.query(
      `SELECT 
        userID AS id, 
        userName AS name, 
        userEmail AS email, 
        DATE_FORMAT(userDOB, '%Y-%m-%d') AS userDOB, 
        userPhoneNumber AS phoneNumber, 
        profileImage,
        incomeType,
        scholarshipType 
      FROM user 
      WHERE userID = ?`,
      [id]
    );

    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const user = users[0];
    
    // Ensure consistent capitalization for incomeType if it exists
    if (user.incomeType) {
      if (user.incomeType.toLowerCase() === "passive") {
        user.incomeType = "Passive";
      } else if (user.incomeType.toLowerCase() === "active") {
        user.incomeType = "Active";
      }
    }
    
    console.log("Retrieved user with:", {
      incomeType: user.incomeType,
      scholarshipType: user.scholarshipType
    });
    
    return res.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching user details." });
  }
};

// Profile Update Endpoint
const updateProfile = async (req, res) => {
  try {
    const { id, name, email, dob, phoneNumber, profileImage, incomeType, scholarshipType } = req.body;
    const userId = req.session.user.id;

    // Validation: ensure the ID matches the logged-in user
    if (id !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized action." });
    }

    // Properly capitalize incomeType
    let formattedIncomeType = null;
    if (incomeType) {
      if (incomeType.toLowerCase() === "passive") {
        formattedIncomeType = "Passive";
      } else if (incomeType.toLowerCase() === "active") {
        formattedIncomeType = "Active";
      } else {
        formattedIncomeType = incomeType; // Keep as is if it's something else
      }
    }

    // Handle scholarshipType based on incomeType
    // If incomeType is not Passive, set scholarshipType to null
    const finalScholarshipType = formattedIncomeType === 'Passive' ? scholarshipType : null;

    console.log("Saving profile with:", {
      incomeType: formattedIncomeType,
      scholarshipType: finalScholarshipType
    });

    await db.query(
      `UPDATE user 
      SET 
        userName = ?, 
        userDOB = STR_TO_DATE(?, '%Y-%m-%d'), 
        userEmail = ?, 
        userPhoneNumber = ?, 
        profileImage = ?,
        incomeType = ?,
        scholarshipType = ?
      WHERE userID = ?`,
      [name, dob, email, phoneNumber, profileImage, formattedIncomeType, finalScholarshipType, userId]
    );
    
    return res.json({
      success: true,
      message: "Profile updated successfully.",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error updating profile." });
  }
};

module.exports = {
  getUserDetails,
  updateProfile
};