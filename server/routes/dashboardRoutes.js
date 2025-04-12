const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const isAuthenticated = require("../middleware/isAuthenticated");

// Get Dashboard Summary
router.get("/summary", isAuthenticated, dashboardController.getDashboardSummary);

module.exports = router;