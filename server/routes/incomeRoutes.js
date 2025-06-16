const express = require("express");
const router = express.Router();
const incomeController = require("../controllers/incomeController"); // Import controller
const isAuthenticated = require("../middleware/isAuthenticated"); // Import middleware

// Add Income
router.post("/add", isAuthenticated, incomeController.addIncome);

// Fetch Income
router.get("/", isAuthenticated, incomeController.fetchIncomes);

// Delete Income
router.delete("/delete/:incomeID", isAuthenticated, incomeController.deleteIncome);

// Update Income
router.put("/update/:incomeID", isAuthenticated, incomeController.updateIncome);

// Get monthly income total
router.get("/monthly", isAuthenticated, incomeController.getMonthlyIncome);

// Check if user has income for a specific month
router.get("/check-monthly", isAuthenticated, incomeController.checkMonthlyIncomeExists);

module.exports = router;