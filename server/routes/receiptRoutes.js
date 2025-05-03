const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController');
const isAuthenticated = require('../middleware/isAuthenticated');

// Process a receipt image
router.post("/process-receipt", isAuthenticated, receiptController.processReceipt);

module.exports = router;