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

// Category Routes
router.get("/budgets/:budgetID/categories", isAuthenticated, budgetController.getCategories);
router.post("/categories", isAuthenticated, budgetController.addCategory);
router.get("/categories/:categoryID", isAuthenticated, budgetController.getCategory);
router.put("/categories/:categoryID", isAuthenticated, budgetController.updateCategory);
router.delete("/categories/:categoryID", isAuthenticated, budgetController.deleteCategory);

module.exports = router;