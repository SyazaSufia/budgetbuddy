const db = require("../db");
const bcrypt = require("bcrypt");

// Sign-in endpoint
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user table
    const userData = await db.query(
      "SELECT userID AS id, userName AS name, userEmail AS email, userPassword AS password, 'user' AS role FROM user WHERE userEmail = ?",
      [email]
    );

    if (userData.length > 0) {
      const user = userData[0];
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (isMatch) {
        req.session.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
        return res.json({ success: true, user: user });
      }
    }

    // Check admin table
    const adminData = await db.query(
      "SELECT adminID AS id, adminName AS name, adminEmail AS email, adminPassword AS password, 'admin' AS role FROM admin WHERE adminEmail = ?",
      [email]
    );

    if (adminData.length > 0) {
      const admin = adminData[0];
      const isMatch = await bcrypt.compare(password, admin.password);
      
      if (isMatch) {
        req.session.user = {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        };
        return res.json({ success: true, user: admin });
      }
    }

    return res.json({
      success: false,
      message: "Invalid email or password.",
    });
    
  } catch (error) {
    console.error("Error in sign-in:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

// Sign-out endpoint
const signOut = (req, res) => {
  if (!req.session.user) {
    return res
      .status(400)
      .json({ success: false, message: "No active session" });
  }

  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error logging out" });
    }

    res.clearCookie("connect.sid", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    });

    return res.json({ success: true, message: "Logged out successfully" });
  });
};

// Check authentication status
const checkAuth = (req, res) => {
  if (req.session.user) {
    return res.json({ isAuthenticated: true, user: req.session.user });
  }
  return res.json({ isAuthenticated: false });
};

module.exports = {
  signIn,
  signOut,
  checkAuth
};