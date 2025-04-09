const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budgetController");
const isAuthenticated = require('../middleware/isAuthenticated'); 

// Get all budgets for logged-in user
router.get("/budgets", isAuthenticated, budgetController.getBudgets);

// Get specific budget details with history
router.get("/budgets/:budgetID", isAuthenticated, budgetController.getBudgetDetails);

// Create a new budget
router.post("/budget", isAuthenticated, budgetController.createBudget);

// Update budget target amount
router.put("/budgets/:budgetID/target", isAuthenticated, budgetController.updateBudgetTarget);

// Delete a budget
router.delete("/budgets/:budgetID", isAuthenticated, budgetController.deleteBudget);

module.exports = router;