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
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const passwordRoutes = require("./routes/passwordRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const receiptRoutes = require('./routes/receiptRoutes');
const budgetRoutes = require("./routes/budgetRoutes");
const adminRoutes = require("./routes/adminRoutes");
const advertisementRoutes = require("./routes/advertisementRoutes");
const adminCommRoutes = require("./routes/adminCommRoutes");
const adminStatsRoutes = require("./routes/adminStatsRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const communityRoutes = require("./routes/communityRoutes");

// Enable the income scheduler since we're not using serverless anymore
const incomeScheduler = require('./services/incomeScheduler');
incomeScheduler.initialize();

// CORS options - allow the deployed frontend and local development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://budgetbuddy.space",
      "https://www.budgetbuddy.space",
      "http://budgetbuddy.space",
      "http://www.budgetbuddy.space",
      "http://145.79.12.85"
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
    credentials: true
  },
  
  methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", 'X-Dev-Bypass-Auth'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
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
    name: "budgetbuddy.session", // Custom session name
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" && process.env.FORCE_HTTPS === "true", // Only use secure in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours (increased from 1 hour)
      sameSite: process.env.NODE_ENV === "production" ? 'lax' : 'lax', // Lax for cross-origin requests
      domain: process.env.NODE_ENV === "production" ? undefined : undefined, // Let browser handle domain
      path: '/'
    },
  })
);

// Ensure Access-Control-Allow-Credentials header is set
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  next();
});

// Development environment
if (process.env.NODE_ENV === 'development') {
  // Development environment
  app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
  app.use('/uploads/ads', express.static(path.join(__dirname, 'public', 'uploads', 'ads')));
} else {
  // Production environment - serve from VPS location
  const uploadPath = '/var/www/budgetbuddy/backend/public/uploads';
  app.use('/uploads', express.static(uploadPath));
  app.use('/uploads/ads', express.static(path.join(uploadPath, 'ads')));
}

// Debug middleware to log static file requests
app.use((req, res, next) => {
  if (req.url.includes('/uploads/')) {
    console.log(`[DEBUG] Static file request: ${req.url}`);
    if (process.env.NODE_ENV === 'production') {
      const fullPath = path.join('/var/www/budgetbuddy/backend/public', req.url);
      console.log(`[DEBUG] Looking for file at: ${fullPath}`);
      console.log(`[DEBUG] File exists: ${fs.existsSync(fullPath)}`);
    }
  }
  next();
});

// Update the debug paths endpoint
app.get('/debug/paths', (req, res) => {
  const path = require('path');
  const fs = require('fs');
  
  const isProd = process.env.NODE_ENV === 'production';
  const baseDir = isProd ? '/var/www/budgetbuddy/backend' : __dirname;
  
  const serverDir = __dirname;
  const publicDir = isProd ? `${baseDir}/public` : path.join(__dirname, 'public');
  const uploadsDir = isProd ? `${baseDir}/public/uploads` : path.join(__dirname, 'public', 'uploads');
  const adsDir = isProd ? `${baseDir}/public/uploads/ads` : path.join(__dirname, 'public', 'uploads', 'ads');
  
  // Check if directories exist
  const debugInfo = {
    environment: process.env.NODE_ENV,
    serverDirectory: serverDir,
    publicDirectory: publicDir,
    uploadsDirectory: uploadsDir,
    adsDirectory: adsDir,
    publicExists: fs.existsSync(publicDir),
    uploadsExists: fs.existsSync(uploadsDir),
    adsExists: fs.existsSync(adsDir),
    nodeEnv: process.env.NODE_ENV,
    files: []
  };
  
  // List files in ads directory
  if (fs.existsSync(adsDir)) {
    try {
      const files = fs.readdirSync(adsDir);
      debugInfo.files = files.map(file => {
        const filePath = path.join(adsDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          fullPath: filePath,
          size: stats.size,
          created: stats.birthtime,
          url: `/uploads/ads/${file}`,
          absolutePath: isProd ? `${adsDir}/${file}` : filePath
        };
      });
    } catch (error) {
      debugInfo.filesError = error.message;
    }
  }
  
  res.json(debugInfo);
});

// Test endpoint to verify specific file serving
app.get('/debug/test-image/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public', 'uploads', 'ads', filename);
  
  console.log(`Testing image: ${filename}`);
  console.log(`File path: ${filePath}`);
  console.log(`File exists: ${fs.existsSync(filePath)}`);
  
  if (fs.existsSync(filePath)) {
    // Try to serve the file directly
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ error: 'Could not send file', details: err.message });
      }
    });
  } else {
    res.status(404).json({ 
      error: 'File not found', 
      path: filePath,
      available: fs.readdirSync(path.join(__dirname, 'public', 'uploads', 'ads'))
    });
  }
});

// Simple request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", environment: process.env.NODE_ENV });
});

// Test specific file access
app.get('/debug/test-file/:filename', (req, res) => {
  const path = require('path');
  const fs = require('fs');
  
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public', 'uploads', 'ads', filename);
  
  const result = {
    filename,
    requestedPath: filePath,
    exists: fs.existsSync(filePath),
    expressStaticWillServe: `/uploads/ads/${filename}`,
    fullUrl: `${req.protocol}://${req.get('host')}/uploads/ads/${filename}`
  };
  
  if (result.exists) {
    const stats = fs.statSync(filePath);
    result.fileInfo = {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime
    };
  }
  
  res.json(result);
});

// API Routes
app.use("/", authRoutes);
app.use("/", profileRoutes);
app.use("/", passwordRoutes);
app.use("/income", incomeRoutes);
app.use("/expense", expenseRoutes);
app.use('/expense', receiptRoutes);
app.use("/budget", budgetRoutes);
app.use("/admin", adminRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/community", communityRoutes);
app.use("/advertisement", advertisementRoutes);
app.use("/admin/community", adminCommRoutes);
app.use("/admin/stats", adminStatsRoutes);

//---------------------------ADMIN ENDPOINTS---------------------------//

// Add Admin endpoint
app.post("/api/add-admin", async (req, res) => {
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
const PORT = process.env.PORT || 43210;

// Serve static files from the React app build directory for production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../build');
  app.use(express.static(frontendPath));
  
  // For any request that doesn't match an API route, send the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Start the server regardless of environment
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});