const express = require('express');
const router = express.Router();
const advertisementController = require('../controllers/advertisementController');

// Route to get active advertisements for user-facing pages
router.get('/active', advertisementController.getActiveAdvertisements);

// Route to check if image exists
router.get('/check-image', (req, res) => {
  const { imagePath } = req.query;
  
  if (!imagePath) {
    return res.status(400).json({ 
      success: false, 
      message: "No image path provided" 
    });
  }
  
  // Security check - make sure the path is within the uploads directory
  const normalizedPath = path.normalize(imagePath);
  if (normalizedPath.includes('..') || !normalizedPath.startsWith('/uploads/')) {
    return res.status(403).json({ 
      success: false, 
      message: "Invalid path" 
    });
  }
  
  const fullPath = path.join(__dirname, '../public', normalizedPath);
  
  // Check if file exists
  fs.access(fullPath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.json({
        success: false,
        exists: false,
        message: "File does not exist",
        requestedPath: normalizedPath,
        fullServerPath: fullPath,
        error: err.message
      });
    }
    
    // Get file stats
    fs.stat(fullPath, (statErr, stats) => {
      if (statErr) {
        return res.json({
          success: false,
          exists: true,
          message: "File exists but couldn't get details",
          requestedPath: normalizedPath,
          fullServerPath: fullPath,
          error: statErr.message
        });
      }
      
      res.json({
        success: true,
        exists: true,
        message: "File exists",
        requestedPath: normalizedPath,
        fullServerPath: fullPath,
        fileSize: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      });
    });
  });
});

// Export the router
module.exports = router;