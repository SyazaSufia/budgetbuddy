const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { resetPassword } = require('../controllers/passwordController');

// Create a limiter for password reset attempts
const resetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many reset attempts. Please try again after 15 minutes.'
    }
});

// Apply the rate limiter to the password reset route
router.post('/reset-password', resetLimiter, resetPassword);

module.exports = router;
