const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const db = require("./db");
const bodyParser = require("body-parser"); // Add this line
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");

const saltRounds = 10;

// Middleware setup
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: '4eba08474238b7a30245666cec4ab4b199199473a2fc9020b8d766cf2cf8731f',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 60 * 1000, // 1 hour,
    sameSite: "none"
  }
}));

// Updated CORS configuration to allow credentials
const corsOptions = {
  origin: ["https://budgetbuddy.space"],
  methods: ["GET", "POST", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type"],
  credentials: true
};

app.use(cors(corsOptions));

// Ensure Access-Control-Allow-Credentials header is set
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ success: false, message: "Not authenticated" });
  }
};

// Sign up with password hashing
app.post("/sign-up", (req, res) => {
  const { userName, userEmail, userPassword, userDOB } = req.body;

  // Check if all required fields are provided
  if (!userName || !userEmail || !userPassword || !userDOB) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  // Check if the email already exists
  const checkEmailSql = "SELECT * FROM user WHERE userEmail = ?";
  db.query(checkEmailSql, [userEmail], (err, data) => {
    if (err) {
      console.error("Error querying database:", err);
      return res.status(500).json({ success: false, message: "Server error." });
    }
    if (data.length > 0) {
      return res.status(400).json({ success: false, message: "Email already exists." });
    }

    // Hash the password
    bcrypt.hash(userPassword, saltRounds, (err, hash) => {
      if (err) {
        console.error("Error hashing password:", err);
        return res.status(500).json({ success: false, message: "Error encrypting password." });
      }

      // Insert new user into the database
      const insertUserSql = "INSERT INTO user (userName, userEmail, userPassword, userDOB) VALUES (?, ?, ?, ?)";
      db.query(insertUserSql, [userName, userEmail, hash, userDOB], (err, result) => {
        if (err) {
          console.error("Error inserting user into database:", err);
          return res.status(500).json({ success: false, message: "Error saving user to database." });
        }
        return res.status(201).json({ success: true, message: "User registered successfully." });
      });
    });
  });
});

// Sign in with session management
app.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;
  console.log("Sign-in request received. Email:", email);

  try {
    const userQuery = "SELECT userID AS id, userName AS name, userEmail AS email, userPassword AS password, 'user' AS role FROM user WHERE userEmail = ?";
    db.query(userQuery, [email], async (userErr, userData) => {
      if (userErr) {
        console.error("Error querying user:", userErr);
        return res.json({ error: true, message: "Error querying database." });
      }

      console.log("User query result:", userData);

      if (userData.length > 0) {
        const user = userData[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          };
          console.log("User authenticated:", user);
          return res.json({ success: true, user: user });
        } else {
          console.log("Password does not match");
        }
      }

      const adminQuery = "SELECT adminID AS id, adminName AS name, adminEmail AS email, adminPassword AS password, 'admin' AS role FROM admin WHERE adminEmail = ?";
      db.query(adminQuery, [email], async (adminErr, adminData) => {
        if (adminErr) {
          console.error("Error querying admin:", adminErr);
          return res.json({ error: true, message: "Error querying database." });
        }

        console.log("Admin query result:", adminData);

        if (adminData.length > 0) {
          const admin = adminData[0];
          const isMatch = await bcrypt.compare(password, admin.password);
          if (isMatch) {
            req.session.user = {
              id: admin.id,
              name: admin.name,
              email: admin.email,
              role: admin.role
            };
            console.log("Admin authenticated:", admin);
            return res.json({ success: true, user: admin });
          } else {
            console.log("Password does not match");
          }
        }

        return res.json({
          success: false,
          message: "Invalid email or password.",
        });
      });
    });

  } catch (err) {
    console.error("Error processing sign-in:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// New route to check authentication status
app.get("/check-auth", (req, res) => {
  if (req.session.user) {
    res.json({ 
      isAuthenticated: true, 
      user: req.session.user 
    });
  } else {
    res.json({ 
      isAuthenticated: false 
    });
  }
});

// Sign out
app.post("/sign-out", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Error logging out" });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: "Logged out successfully" });
  });
});

// Protect routes that require authentication
app.get("/protected-route", isAuthenticated, (req, res) => {
  res.json({ success: true, data: "Protected data" });
});

// ------------------------------------- ADMIN SIDE -------------------------------------

// Route to add an admin with hashed password
app.post("/add-admin", (req, res) => {
  const { adminName, adminEmail, adminPassword } = req.body;

  console.log("Received request to add admin:", req.body);

  // Check if all required fields are provided
  if (!adminName || !adminEmail || !adminPassword) {
    console.error("Missing required fields");
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  // Hash the password
  bcrypt.hash(adminPassword, saltRounds, (err, hash) => {
    if (err) {
      console.error("Error hashing password:", err);
      return res.status(500).json({ success: false, message: "Error encrypting password." });
    }

    // Insert new admin into the database
    const insertAdminSql = "INSERT INTO admin (adminName, adminEmail, adminPassword, role) VALUES (?, ?, ?, 'admin')";
    db.query(insertAdminSql, [adminName, adminEmail, hash], (err, result) => {
      if (err) {
        console.error("Error inserting admin into database:", err);
        return res.status(500).json({ success: false, message: "Error saving admin to database." });
      }
      console.log("Admin added successfully");
      return res.status(201).json({ success: true, message: "Admin added successfully." });
    });
  });
});

app.listen(8080, () => {
    console.log("Server running on port 8080");
});
