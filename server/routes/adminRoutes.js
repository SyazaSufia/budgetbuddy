const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const isAuthenticated = require("../middleware/isAuthenticated");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create the directory if it doesn't exist
    const uploadDir = path.join(__dirname, "../public/uploads/ads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, "ad-" + uniqueSuffix + extension);
  },
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }
});

// User management routes
router.get("/users", isAuthenticated, adminController.getAllUsers);
router.delete("/users/:id", isAuthenticated, adminController.deleteUser);

// Advertisement management routes
router.get("/advertisements", isAuthenticated, adminController.getAllAdvertisements);
router.get("/advertisements/:id", isAuthenticated, adminController.getAdvertisementById);
router.post("/advertisements", isAuthenticated, upload.single("image"), adminController.createAdvertisement);
router.put("/advertisements/:id", isAuthenticated, upload.single("image"), adminController.updateAdvertisement);
router.delete("/advertisements/:id", isAuthenticated, adminController.deleteAdvertisement);

module.exports = router;