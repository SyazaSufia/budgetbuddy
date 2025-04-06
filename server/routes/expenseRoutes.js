const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController'); // Adjust the path as needed
const isAuthenticated = require('../middleware/isAuthenticated'); // Adjust the path to your middleware

// Category Routes
router.post('/category', isAuthenticated, expenseController.addCategory); // Add new category
router.get('/categories', isAuthenticated, expenseController.getCategories); // Get all categories for logged-in user
router.delete('/category/:id', isAuthenticated, expenseController.deleteCategory); // Delete a category

// Expense Routes
router.post('/expense', isAuthenticated, expenseController.addExpense); // Add new expense
router.get('/category/:categoryID/expenses', isAuthenticated, expenseController.getCategoryExpenses); // Get expenses for a category
router.put('/expense/:id', isAuthenticated, expenseController.editExpense); // Edit an expense
router.delete('/expense/:id', isAuthenticated, expenseController.deleteExpense); // Delete an expense

module.exports = router;