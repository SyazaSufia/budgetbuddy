const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const db = require('./db');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const multer = require('multer'); // Import multer for file uploads
const fs = require('fs');
const passwordRoutes = require('./routes/passwordRoutes'); // Import password routes

// CORS options
const corsOptions = {
  origin: ["http://localhost:5173", "https://budgetbuddy.space", "https://www.budgetbuddy.space"],
  methods: ["GET", "POST", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
};

const saltRounds = 10;

// Middleware setup
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors(corsOptions)); // Single CORS configuration
app.options('*', cors(corsOptions)); // Allow preflight requests

// Session configuration
app.use(
  session({
    secret: '4eba08474238b7a30245666cec4ab4b199199473a2fc9020b8d766cf2cf8731f',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000, // 1 hour
    },
  })
);

// Ensure Access-Control-Allow-Credentials header is set
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// File storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.status(401).json({ success: false, message: 'Not authenticated' });
};

// Password reset routes
app.use('/api', passwordRoutes);

// Sign-up endpoint
app.post('/sign-up', (req, res) => {
  const { userName, userEmail, userPassword, userDOB } = req.body;

  if (!userName || !userEmail || !userPassword || !userDOB) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  const checkEmailSql = 'SELECT * FROM user WHERE userEmail = ?';
  db.query(checkEmailSql, [userEmail], (err, data) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
    if (data.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists.' });
    }

    bcrypt.hash(userPassword, saltRounds, (err, hash) => {
      if (err) {
        console.error('Error hashing password:', err);
        return res.status(500).json({ success: false, message: 'Error encrypting password.' });
      }

      const insertUserSql = 'INSERT INTO user (userName, userEmail, userPassword, userDOB) VALUES (?, ?, ?, ?)';
      db.query(insertUserSql, [userName, userEmail, hash, userDOB], (err, result) => {
        if (err) {
          console.error('Error inserting user into database:', err);
          return res.status(500).json({ success: false, message: 'Error saving user to database.' });
        }
        return res.status(201).json({ success: true, message: 'User registered successfully.' });
      });
    });
  });
});

// Sign-in endpoint
app.post('/sign-in', async (req, res) => {
  const { email, password } = req.body;
  console.log('Sign-in request received. Email:', email);

  try {
    const userQuery = 'SELECT userID AS id, userName AS name, userEmail AS email, userPassword AS password, ' +
      "'user' AS role FROM user WHERE userEmail = ?";
    db.query(userQuery, [email], async (userErr, userData) => {
      if (userErr) {
        console.error('Error querying user:', userErr);
        return res.json({ error: true, message: 'Error querying database.' });
      }

      console.log('User query result:', userData);

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
          console.log('User authenticated:', user);
          return res.json({ success: true, user: user });
        } else {
          console.log('Password does not match');
        }
      }

      const adminQuery = 'SELECT adminID AS id, adminName AS name, adminEmail AS email, adminPassword AS password, ' +
        "'admin' AS role FROM admin WHERE adminEmail = ?";
      db.query(adminQuery, [email], async (adminErr, adminData) => {
        if (adminErr) {
          console.error('Error querying admin:', adminErr);
          return res.json({ error: true, message: 'Error querying database.' });
        }

        console.log('Admin query result:', adminData);

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
            console.log('Admin authenticated:', admin);
            return res.json({ success: true, user: admin });
          } else {
            console.log('Password does not match');
          }
        }

        return res.json({
          success: false,
          message: 'Invalid email or password.',
        });
      });
    });
  } catch (err) {
    console.error('Error processing sign-in:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// Sign-out endpoint
app.post("/sign-out", (req, res) => {
  if (!req.session.user) {
    return res.status(400).json({ success: false, message: "No active session" });
  }

  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({ success: false, message: "Error logging out" });
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

// Profile Image Upload Endpoint
app.post('/upload', isAuthenticated, upload.single('image'), (req, res) => {
  if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  const mimeType = req.file.mimetype;

  const updateProfilePictureSql = 'UPDATE user SET profileImage = ?, imageMimeType = ? WHERE userID = ?';

  db.query(updateProfilePictureSql, [imageUrl, mimeType, req.session.user.id], (err, result) => {
      if (err) {
          console.error('Error updating profile picture:', err);
          return res.status(500).json({ success: false, message: 'Error updating profile picture.' });
      }
      res.json({ success: true, imageUrl });
  });
});

// Update Profile Picture Endpoint
app.post('/update-profile-picture', isAuthenticated, (req, res) => {
  const { id, profileImage } = req.body;

  if (!id || !profileImage) {
    return res.status(400).json({ success: false, message: 'User ID and profile image URL are required.' });
  }

  const updateProfilePictureSql = 'UPDATE user SET profileImage = ? WHERE userID = ?';

  db.query(updateProfilePictureSql, [profileImage, id], (err, result) => {
    if (err) {
      console.error('Error updating profile picture:', err);
      return res.status(500).json({ success: false, message: 'Error updating profile picture.' });
    }
    return res.json({ success: true, message: 'Profile picture updated successfully.' });
  });
});

/// Fetch User Details Endpoint
app.get('/get-user-details', isAuthenticated, (req, res) => {
  const { id } = req.session.user;

  const getUserDetailsSql = `
    SELECT 
      userID AS id, 
      userName AS name, 
      userEmail AS email, 
      userDOB, 
      userPhoneNumber AS phoneNumber, 
      userUniversity AS university, 
      userCourse AS course, 
      userYearOfStudy AS yearOfStudy, 
      profileImage 
    FROM user 
    WHERE userID = ?`;

  db.query(getUserDetailsSql, [id], (err, data) => {
    if (err) {
      console.error('Error fetching user details:', err);
      return res.status(500).json({ success: false, message: 'Error fetching user details.' });
    }

    if (data.length === 0) {
      console.log('User not found');
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = data[0];
    console.log('User details:', user);
    return res.json({ success: true, user });
  });
});

// Endpoint to get profile image blob
app.get('/profile-image/:userId', (req, res) => {
  const { userId } = req.params;

  const getImageBlobSql = 'SELECT profileImage, imageMimeType FROM user WHERE userID = ?';
  db.query(getImageBlobSql, [userId], (err, data) => {
      if (err) {
          console.error('Error fetching image blob:', err);
          return res.status(500).json({ success: false, message: 'Error fetching image blob.' });
      }

      if (data.length === 0 || !data[0].profileImage) {
          return res.status(404).json({ success: false, message: 'Image not found.' });
      }

      const imageBlob = data[0].profileImage;
      const mimeType = data[0].imageMimeType;

      if (!mimeType) {
          console.error("MIME type not found for image");
          return res.status(500).json({success: false, message: "MIME type not found."})
      }

      // Debugging: Log the MIME type
      console.log("MIME Type:", mimeType);

      res.writeHead(200, {
          'Content-Type': mimeType,
          'Content-Length': imageBlob.length,
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
      });
      res.end(imageBlob);
  });
});

// Update Profile Endpoint
app.post('/update-profile', isAuthenticated, (req, res) => {
  const { id, name, age, email, phoneNumber, university, course, yearOfStudy, profileImage } = req.body;

  if (!id || !name || !age || !email || !phoneNumber || !university || !course || !yearOfStudy) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  const updateProfileSql = `
    UPDATE user 
    SET 
      userName = ?, 
      userEmail = ?, 
      userPhoneNumber = ?, 
      userUniversity = ?, 
      userCourse = ?, 
      userYearOfStudy = ?, 
      profileImage = ? 
    WHERE userID = ?`;

  db.query(updateProfileSql, [name, email, phoneNumber, university, course, yearOfStudy, profileImage, id], (err, result) => {
    if (err) {
      console.error('Error updating profile:', err);
      return res.status(500).json({ success: false, message: 'Error updating profile.' });
    }
    return res.json({ success: true, message: 'Profile updated successfully.' });
  });
});

//-------------------- Admin routes --------------------

app.post('/add-admin', (req, res) => {
  const { adminName, adminEmail, adminPassword } = req.body;

  console.log('Received request to add admin:', req.body);

  if (!adminName || !adminEmail || !adminPassword) {
    console.error('Missing required fields');
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  bcrypt.hash(adminPassword, saltRounds, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).json({ success: false, message: 'Error encrypting password.' });
    }

    const insertAdminSql = 'INSERT INTO admin (adminName, adminEmail, adminPassword, role) VALUES (?, ?, ?, ' +
      "'admin')";
    db.query(insertAdminSql, [adminName, adminEmail, hash], (err, result) => {
      if (err) {
        console.error('Error inserting admin into database:', err);
        return res.status(500).json({ success: false, message: 'Error saving admin to database.' });
      }
      console.log('Admin added successfully');
      return res.status(201).json({ success: true, message: 'Admin added successfully.' });
    });
  });
});

app.listen(8080, () => {
  console.log('Server running on port 8080');
});
