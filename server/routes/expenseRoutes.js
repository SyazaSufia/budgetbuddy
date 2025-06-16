const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const isAuthenticated = require('../middleware/isAuthenticated');

// Expense Routes
router.post("/expenses", isAuthenticated, expenseController.addExpense);
router.get("/categories/:categoryID/expenses", isAuthenticated, expenseController.getCategoryExpenses);
router.get("/expenses/:expenseID", isAuthenticated, expenseController.getExpense);
router.put("/expenses/:expenseID", isAuthenticated, expenseController.updateExpense);
router.delete("/expenses/:expenseID", isAuthenticated, expenseController.deleteExpense);

router.post("/validate-addition", isAuthenticated, expenseController.validateExpenseAddition);
router.get("/monthly-summary", isAuthenticated, expenseController.getMonthlyExpenseSummary);

module.exports = router;