const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budgetController");
const isAuthenticated = require('../middleware/isAuthenticated');

// Budget Routes
router.get("/budgets", isAuthenticated, budgetController.getBudgets);
router.get("/budgets/:budgetID", isAuthenticated, budgetController.getBudgetDetails);
router.post("/budgets", isAuthenticated, budgetController.createBudget);
router.put("/budgets/:budgetID", isAuthenticated, budgetController.updateBudget);
router.delete("/budgets/:budgetID", isAuthenticated, budgetController.deleteBudget);

// Category Routes - IMPORTANT: Specific routes MUST come before parameterized routes
router.get('/categories/time-filter', isAuthenticated, budgetController.getCategoriesForTimeFilter);
router.get("/budgets/:budgetID/categories", isAuthenticated, budgetController.getCategories);
router.post("/categories", isAuthenticated, budgetController.addCategory);
router.put("/categories/:categoryID", isAuthenticated, budgetController.updateCategory);
router.delete("/categories/:categoryID", isAuthenticated, budgetController.deleteCategory);
// This parameterized route MUST come LAST among category GET routes
router.get("/categories/:categoryID", isAuthenticated, budgetController.getCategory);

module.exports = router;