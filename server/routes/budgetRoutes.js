const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController'); // Adjust the path as needed
const isAuthenticated = require('../middleware/isAuthenticated'); // Adjust the path to your middleware

// Budget Routes
router.post('/budgets', isAuthenticated, budgetController.createBudget); // Create a new budget
router.get('/budgets', isAuthenticated, budgetController.getBudgets); // Get all budgets for logged-in user

module.exports = router;
