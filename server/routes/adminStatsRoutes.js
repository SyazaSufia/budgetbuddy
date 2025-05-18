const express = require("express");
const router = express.Router();
const adminStatsController = require("../controllers/adminStatsController");
const isAuthenticated = require("../middleware/isAuthenticated");

// Debug endpoint to verify route is accessible
router.get("/test", (req, res) => {
  res.json({ message: "Admin routes are accessible" });
});

// Stats routes
router.get("/income", isAuthenticated, adminStatsController.getIncomeTypeStats);
router.get("/scholarship", isAuthenticated, adminStatsController.getScholarshipTypeStats);
router.get("/all", isAuthenticated, adminStatsController.getAllStats);

// Create a non-authenticated version of the route for testing
router.get("/all-test", adminStatsController.getAllStats);

module.exports = router;