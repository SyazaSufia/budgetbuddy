const express = require("express");
const app = express();
const cors = require("cors");
const db = require("./db");

const corsOptions = {
    origin: "http://localhost:5173",
};

app.use(cors(corsOptions));

const bodyParser = require("body-parser");
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
    httpOnly: false,
    maxAge: 60 * 60 * 1000 // 1 hour
  }
}));

// Updated CORS configuration to allow credentials
app.use(cors({
  origin: ["https://budgetbuddy.space", "http://localhost:5173"],
  methods: ["GET", "POST", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type"],
  credentials: true
}));

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

app.listen(8080, () => {
    console.log("Server running on port 8080");
});