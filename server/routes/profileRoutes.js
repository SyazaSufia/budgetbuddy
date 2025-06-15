const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const isAuthenticated = require("../middleware/isAuthenticated");

// Profile routes
router.get("/get-user-details", isAuthenticated, profileController.getUserDetails);
router.post("/update-profile", isAuthenticated, profileController.updateProfile);

module.exports = router;