const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { getDashboardSummary, downloadDashboardPDF } = require('../controllers/dashboardController');
const isAuthenticated = require("../middleware/isAuthenticated");

// Get Dashboard Summary
router.get("/summary", isAuthenticated, dashboardController.getDashboardSummary);
router.get('/download-pdf', isAuthenticated, downloadDashboardPDF);

module.exports = router;