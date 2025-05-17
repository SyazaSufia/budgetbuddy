const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const fs = require("fs");
const db = require("./db");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");

// Setup Google Cloud credentials from environment variable
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  try {
    // Create a temp directory if it doesn't exist
    const credentialsDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(credentialsDir)) {
      fs.mkdirSync(credentialsDir, { recursive: true });
    }
    
    // Write the credentials to a file
    const credentialsPath = path.join(credentialsDir, 'google-credentials.json');
    fs.writeFileSync(credentialsPath, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    
    // Set the environment variable to point to this file
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
    console.log("Google Cloud credentials configured from environment variable");
  } catch (error) {
    console.error("Error setting up Google credentials:", error);
  }
}

// Import routes
const passwordRoutes = require("./routes/passwordRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const receiptRoutes = require('./routes/receiptRoutes');
const budgetRoutes = require("./routes/budgetRoutes");
const adminRoutes = require("./routes/adminRoutes");
const advertisementRoutes = require("./routes/advertisementRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const communityRoutes = require("./routes/communityRoutes");

// Enable the income scheduler since we're not using serverless anymore
const incomeScheduler = require('./services/incomeScheduler');
incomeScheduler.initialize();

const isAuthenticated = require("./middleware/isAuthenticated");

// CORS options - allow the deployed frontend and local development
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://budgetbuddy.space",
    "https://www.budgetbuddy.space"
  ],
  methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

const saltRounds = 10;

// Middleware setup
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Session configuration - Note that for production you should use a proper session store
app.use(
  session({
    secret: process.env.SESSION_SECRET || "4eba08474238b7a30245666cec4ab4b199199473a2fc9020b8d766cf2cf8731f",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000, // 1 hour
    },
  })
);

// Ensure Access-Control-Allow-Credentials header is set
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Serve static files - IMPORTANT for serving uploaded images
app.use(express.static(path.join(__dirname, 'public')));

// Simple request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", environment: process.env.NODE_ENV });
});

// API Routes
app.use("/api", passwordRoutes);
app.use("/income", incomeRoutes);
app.use("/expense", expenseRoutes);
app.use('/expense', receiptRoutes);
app.use("/budget", budgetRoutes);
app.use("/admin", adminRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/community", communityRoutes);
app.use("/advertisement", advertisementRoutes);

// Sign-up endpoint
app.post("/sign-up", async (req, res) => {
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
});

// Sign-in endpoint
app.post("/sign-in", async (req, res) => {
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
});

// Sign-out endpoint
app.post("/sign-out", (req, res) => {
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
});

// Check authentication status
app.get("/check-auth", (req, res) => {
  if (req.session.user) {
    return res.json({ isAuthenticated: true, user: req.session.user });
  }
  return res.json({ isAuthenticated: false });
});

// Fetch User Details Endpoint
app.get("/get-user-details", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.session.user;

    const users = await db.query(
      `SELECT 
        userID AS id, 
        userName AS name, 
        userEmail AS email, 
        DATE_FORMAT(userDOB, '%Y-%m-%d') AS userDOB, 
        userPhoneNumber AS phoneNumber, 
        profileImage 
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
    return res.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching user details." });
  }
});

// Update Profile Endpoint
app.post("/update-profile", isAuthenticated, async (req, res) => {
  try {
    const { id, name, email, dob, phoneNumber, profileImage } = req.body;
    const userId = req.session.user.id;

    // Validation: ensure the ID matches the logged-in user
    if (id !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized action." });
    }

    await db.query(
      `UPDATE user 
      SET 
        userName = ?, 
        userDOB = STR_TO_DATE(?, '%Y-%m-%d'), 
        userEmail = ?, 
        userPhoneNumber = ?, 
        profileImage = ? 
      WHERE userID = ?`,
      [name, dob, email, phoneNumber, profileImage, userId]
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
});

// Add Admin endpoint
app.post("/add-admin", async (req, res) => {
  try {
    const { adminName, adminEmail, adminPassword } = req.body;

    if (!adminName || !adminEmail || !adminPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    const hash = await bcrypt.hash(adminPassword, saltRounds);
    
    await db.query(
      "INSERT INTO admin (adminName, adminEmail, adminPassword, role) VALUES (?, ?, ?, 'admin')",
      [adminName, adminEmail, hash]
    );
    
    return res
      .status(201)
      .json({ success: true, message: "Admin added successfully." });
  } catch (error) {
    console.error("Error adding admin:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error saving admin to database." });
  }
});

// Ensure the root route returns a 200 status for Render health checks
app.get('/', (req, res) => {
  res.status(200).send('BudgetBuddy API server running');
});

// Development vs Production server setup
const PORT = process.env.PORT || 8080;

// Serve static files from the React app build directory for production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../build');
  app.use(express.static(frontendPath));
  
  // For any request that doesn't match an API route, send the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Path to check
const publicDir = path.join(__dirname, 'public');
const uploadsDir = path.join(__dirname, 'public', 'uploads', 'ads');

// Check if directories exist
console.log(`Checking if public directory exists: ${publicDir}`);
console.log(`Public directory exists: ${fs.existsSync(publicDir)}`);

console.log(`Checking if uploads directory exists: ${uploadsDir}`);
console.log(`Uploads directory exists: ${fs.existsSync(uploadsDir)}`);

// List files in uploads/ads directory if it exists
if (fs.existsSync(uploadsDir)) {
  console.log('Files in uploads/ads directory:');
  const files = fs.readdirSync(uploadsDir);
  files.forEach(file => {
    console.log(`- ${file}`);
  });
}

// Simple route to test static file serving
app.get('/', (req, res) => {
  res.send(`
    <h1>Image Path Checker</h1>
    <p>Public directory: ${publicDir}</p>
    <p>Public directory exists: ${fs.existsSync(publicDir)}</p>
    <p>Uploads directory: ${uploadsDir}</p>
    <p>Uploads directory exists: ${fs.existsSync(uploadsDir)}</p>
    <h2>Files in uploads/ads:</h2>
    <ul>
      ${fs.existsSync(uploadsDir) 
        ? fs.readdirSync(uploadsDir).map(file => `<li>${file} (<a href="/uploads/ads/${file}" target="_blank">view</a>)</li>`).join('') 
        : 'Directory does not exist'}
    </ul>
  `);
});

// Serve static files - important for image display
app.use(express.static(publicDir));

// Start the server regardless of environment
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});