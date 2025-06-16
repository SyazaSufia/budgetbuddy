const db = require("../db");

// Helper function to get monthly income total
const getMonthlyIncomeTotal = async (userID, month, year) => {
  const query = `
    SELECT SUM(amount) as totalIncome
    FROM income
    WHERE userID = ? 
      AND MONTH(date) = ? 
      AND YEAR(date) = ?
  `;
  
  const results = await db.query(query, [userID, month, year]);
  return parseFloat(results[0]?.totalIncome || 0);
};

// Helper function to get monthly budget total
const getMonthlyBudgetTotal = async (userID, month, year, excludeBudgetID = null) => {
  let query = `
    SELECT SUM(targetAmount) as totalBudget
    FROM budgets
    WHERE userID = ? 
      AND MONTH(createdAt) = ? 
      AND YEAR(createdAt) = ?
  `;
  
  const params = [userID, month, year];
  
  if (excludeBudgetID) {
    query += " AND budgetID != ?";
    params.push(excludeBudgetID);
  }
  
  const results = await db.query(query, params);
  return parseFloat(results[0]?.totalBudget || 0);
};

// Get all budgets for logged-in user
exports.getBudgets = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const { timeFilter } = req.query; // Get timeFilter from query params

    let dateCondition = "";
    const queryParams = [userID];

    // Get current date for calculations
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Add date filtering based on timeFilter parameter
    if (timeFilter) {
      let startDate;

      switch (timeFilter) {
        case "thisMonth":
          // First day of current month to today
          startDate = new Date(currentYear, currentMonth, 1);
          dateCondition = " AND b.createdAt >= ?";
          queryParams.push(startDate);
          break;

        case "lastMonth":
          // First day of last month to last day of last month
          startDate = new Date(currentYear, currentMonth - 1, 1);
          const endDate = new Date(currentYear, currentMonth, 0);
          dateCondition = " AND b.createdAt >= ? AND b.createdAt <= ?";
          queryParams.push(startDate, endDate);
          break;

        case "thisYear":
          // First day of current year to today
          startDate = new Date(currentYear, 0, 1);
          dateCondition = " AND b.createdAt >= ?";
          queryParams.push(startDate);
          break;

        case "last12Months":
          // 12 months ago from today to today
          startDate = new Date(currentYear, currentMonth - 11, 1);
          dateCondition = " AND b.createdAt >= ?";
          queryParams.push(startDate);
          break;

        default:
          // No filter or invalid filter, return all budgets
          break;
      }
    }

    const query = `
      SELECT b.budgetID, b.budgetName, b.targetAmount, b.icon, b.createdAt
      FROM budgets b
      WHERE b.userID = ?${dateCondition}
    `;

    const results = await db.query(query, queryParams);

    // Ensure numeric values are properly formatted
    const formattedResults = results.map((budget) => ({
      ...budget,
      targetAmount: parseFloat(budget.targetAmount || 2000),
    }));

    res.status(200).json({ success: true, data: formattedResults });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get specific budget details including categories and their expenses
exports.getBudgetDetails = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const { budgetID } = req.params;

    if (!req.session || !req.session.user) {
      console.log("Authentication failed: No session or user");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Get budget information
    const budgetQuery = `
      SELECT 
        b.budgetID, 
        b.budgetName,
        b.targetAmount,
        b.icon
      FROM budgets b
      WHERE b.userID = ? AND b.budgetID = ?
    `;

    // Get categories for this budget
    const categoriesQuery = `
      SELECT 
        c.categoryID, 
        c.categoryName, 
        c.icon, 
        COALESCE(c.categoryAmount, 0) AS categoryAmount
      FROM categories c
      WHERE c.userID = ? AND c.budgetID = ?
    `;

    const budgetResults = await db.query(budgetQuery, [userID, budgetID]);

    if (budgetResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    const budget = {
      ...budgetResults[0],
      targetAmount: parseFloat(budgetResults[0].targetAmount || 2000),
    };

    const categoryResults = await db.query(categoriesQuery, [userID, budgetID]);

    // Format category amounts
    const formattedCategories = categoryResults.map((category) => ({
      ...category,
      categoryAmount: parseFloat(category.categoryAmount || 0),
    }));

    res.status(200).json({
      success: true,
      data: {
        budget: budget,
        categories: formattedCategories,
      },
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// NEW: Validate budget creation against income
exports.validateBudgetCreation = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const { budgetName, targetAmount } = req.body;

    if (!budgetName || !targetAmount) {
      return res.status(400).json({
        success: false,
        message: "Budget name and target amount are required."
      });
    }

    // Get current month/year
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11
    const currentYear = now.getFullYear();

    // Check if user has income for current month
    const monthlyIncome = await getMonthlyIncomeTotal(userID, currentMonth, currentYear);
    
    if (monthlyIncome <= 0) {
      return res.status(400).json({
        success: false,
        message: "You must add income for this month before creating a budget.",
        code: "NO_INCOME"
      });
    }

    // Get current month's total budgets
    const currentBudgetTotal = await getMonthlyBudgetTotal(userID, currentMonth, currentYear);
    
    // Check if new budget would exceed income
    const newTotalBudget = currentBudgetTotal + parseFloat(targetAmount);
    
    if (newTotalBudget > monthlyIncome) {
      return res.status(400).json({
        success: false,
        message: `Total budget amount (RM ${newTotalBudget.toFixed(2)}) would exceed your monthly income (RM ${monthlyIncome.toFixed(2)}). Available budget: RM ${(monthlyIncome - currentBudgetTotal).toFixed(2)}`,
        code: "EXCEEDS_INCOME",
        data: {
          monthlyIncome,
          currentBudgetTotal,
          requestedAmount: parseFloat(targetAmount),
          availableBudget: monthlyIncome - currentBudgetTotal
        }
      });
    }

    // Validation passed
    res.status(200).json({
      success: true,
      message: "Budget can be created.",
      data: {
        monthlyIncome,
        currentBudgetTotal,
        requestedAmount: parseFloat(targetAmount),
        remainingBudget: monthlyIncome - newTotalBudget
      }
    });

  } catch (err) {
    console.error("Error validating budget creation:", err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to validate budget creation." 
    });
  }
};

// NEW: Get budget summary for validation
exports.getBudgetSummary = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const { month, year } = req.query;

    // If no month/year provided, use current month/year
    const now = new Date();
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year) : now.getFullYear();

    // Get monthly income
    const monthlyIncome = await getMonthlyIncomeTotal(userID, targetMonth, targetYear);
    
    // Get monthly budget total
    const monthlyBudgetTotal = await getMonthlyBudgetTotal(userID, targetMonth, targetYear);

    // Get monthly expense total
    const expenseQuery = `
      SELECT SUM(e.amount) as totalExpenses
      FROM expenses e
      JOIN categories c ON e.categoryID = c.categoryID
      JOIN budgets b ON c.budgetID = b.budgetID
      WHERE e.userID = ? 
        AND MONTH(e.date) = ? 
        AND YEAR(e.date) = ?
    `;
    
    const expenseResults = await db.query(expenseQuery, [userID, targetMonth, targetYear]);
    const monthlyExpenseTotal = parseFloat(expenseResults[0]?.totalExpenses || 0);

    res.status(200).json({
      success: true,
      data: {
        monthlyIncome,
        monthlyBudgetTotal,
        monthlyExpenseTotal,
        remainingBudget: monthlyIncome - monthlyBudgetTotal,
        remainingIncome: monthlyIncome - monthlyExpenseTotal,
        month: targetMonth,
        year: targetYear
      }
    });

  } catch (err) {
    console.error("Error getting budget summary:", err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to get budget summary." 
    });
  }
};

// Create a new budget - UPDATED with validation
exports.createBudget = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const { budgetName, targetAmount = 2000, icon = "default-icon" } = req.body;

    if (!budgetName) {
      return res.status(400).json({
        success: false,
        message: "Budget name is required.",
      });
    }

    // Get current month/year for validation
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Check if user has income for current month
    const monthlyIncome = await getMonthlyIncomeTotal(userID, currentMonth, currentYear);
    
    if (monthlyIncome <= 0) {
      return res.status(400).json({
        success: false,
        message: "You must add income for this month before creating a budget.",
        code: "NO_INCOME"
      });
    }

    // Get current month's total budgets
    const currentBudgetTotal = await getMonthlyBudgetTotal(userID, currentMonth, currentYear);
    
    // Check if new budget would exceed income
    const newTotalBudget = currentBudgetTotal + parseFloat(targetAmount);
    
    if (newTotalBudget > monthlyIncome) {
      return res.status(400).json({
        success: false,
        message: `Total budget amount (RM ${newTotalBudget.toFixed(2)}) would exceed your monthly income (RM ${monthlyIncome.toFixed(2)}). Available budget: RM ${(monthlyIncome - currentBudgetTotal).toFixed(2)}`,
        code: "EXCEEDS_INCOME",
        data: {
          monthlyIncome,
          currentBudgetTotal,
          requestedAmount: parseFloat(targetAmount),
          availableBudget: monthlyIncome - currentBudgetTotal
        }
      });
    }

    // Define current month boundaries for duplicate check
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    // Check if a budget with this name already exists for this user IN THE CURRENT MONTH ONLY
    const checkQuery = `
      SELECT budgetID, budgetName, createdAt FROM budgets 
      WHERE userID = ? AND budgetName = ? 
      AND createdAt >= ? AND createdAt <= ?
    `;

    const checkResults = await db.query(checkQuery, [
      userID,
      budgetName,
      startOfMonth,
      endOfMonth,
    ]);

    if (checkResults.length > 0) {
      return res.status(400).json({
        success: false,
        message: `A budget with the name "${budgetName}" already exists for this month.`,
      });
    }

    // If all validations pass, proceed to insert
    const insertQuery = `INSERT INTO budgets (userID, budgetName, targetAmount, icon) VALUES (?, ?, ?, ?)`;
    const result = await db.query(insertQuery, [
      userID,
      budgetName,
      targetAmount,
      icon,
    ]);

    res.status(201).json({
      success: true,
      data: {
        budgetID: result.insertId,
        budgetName,
        targetAmount: parseFloat(targetAmount),
        icon,
      },
      message: "Budget created successfully!",
    });
  } catch (err) {
    console.error('Error creating budget:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update a budget's details - UPDATED with validation
exports.updateBudget = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const { budgetID } = req.params;
    const { budgetName, targetAmount, icon } = req.body;

    if (!budgetName && !targetAmount && !icon) {
      return res.status(400).json({
        success: false,
        message:
          "At least one field (budgetName, targetAmount, or icon) is required",
      });
    }

    // If targetAmount is being updated, validate against income
    if (targetAmount) {
      // Get current budget info
      const currentBudgetQuery = `
        SELECT targetAmount, createdAt FROM budgets 
        WHERE budgetID = ? AND userID = ?
      `;
      
      const currentBudgetResults = await db.query(currentBudgetQuery, [budgetID, userID]);
      
      if (currentBudgetResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Budget not found",
        });
      }

      const currentBudget = currentBudgetResults[0];
      const budgetDate = new Date(currentBudget.createdAt);
      const budgetMonth = budgetDate.getMonth() + 1;
      const budgetYear = budgetDate.getFullYear();

      // Get monthly income for the budget's month
      const monthlyIncome = await getMonthlyIncomeTotal(userID, budgetMonth, budgetYear);
      
      // Get current month's total budgets (excluding this budget)
      const currentBudgetTotal = await getMonthlyBudgetTotal(userID, budgetMonth, budgetYear, budgetID);
      
      // Check if updated budget would exceed income
      const newTotalBudget = currentBudgetTotal + parseFloat(targetAmount);
      
      if (newTotalBudget > monthlyIncome) {
        return res.status(400).json({
          success: false,
          message: `Updated budget amount would cause total budgets (RM ${newTotalBudget.toFixed(2)}) to exceed monthly income (RM ${monthlyIncome.toFixed(2)}). Available budget: RM ${(monthlyIncome - currentBudgetTotal).toFixed(2)}`,
          code: "EXCEEDS_INCOME",
          data: {
            monthlyIncome,
            currentBudgetTotal,
            requestedAmount: parseFloat(targetAmount),
            availableBudget: monthlyIncome - currentBudgetTotal
          }
        });
      }
    }

    let updateQuery = "UPDATE budgets SET ";
    const queryParams = [];
    let paramAdded = false;

    if (budgetName) {
      updateQuery += "budgetName = ?";
      queryParams.push(budgetName);
      paramAdded = true;
    }

    if (targetAmount) {
      if (paramAdded) updateQuery += ", ";
      updateQuery += "targetAmount = ?";
      queryParams.push(targetAmount);
      paramAdded = true;
    }

    if (icon) {
      if (paramAdded) updateQuery += ", ";
      updateQuery += "icon = ?";
      queryParams.push(icon);
    }

    updateQuery += " WHERE budgetID = ? AND userID = ?";
    queryParams.push(budgetID, userID);

    const result = await db.query(updateQuery, queryParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Budget not found or you don't have permission to update it",
      });
    }

    res.status(200).json({
      success: true,
      message: "Budget updated successfully",
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete a budget
exports.deleteBudget = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const { budgetID } = req.params;

    // Start a transaction
    await db.query('START TRANSACTION');

    try {
      // First, delete all expenses associated with the budget's categories
      const deleteExpensesQuery = `
        DELETE e FROM expenses e
        INNER JOIN categories c ON e.categoryID = c.categoryID
        WHERE c.budgetID = ? AND c.userID = ?
      `;
      
      await db.query(deleteExpensesQuery, [budgetID, userID]);

      // Then delete all categories associated with this budget
      const deleteCategoriesQuery = `
        DELETE FROM categories 
        WHERE budgetID = ? AND userID = ?
      `;

      await db.query(deleteCategoriesQuery, [budgetID, userID]);

      // Finally delete the budget
      const deleteBudgetQuery = `
        DELETE FROM budgets 
        WHERE budgetID = ? AND userID = ?
      `;

      const result = await db.query(deleteBudgetQuery, [budgetID, userID]);

      if (result.affectedRows === 0) {
        await db.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: "Budget not found or you don't have permission to delete it"
        });
      }

      // Commit the transaction
      await db.query('COMMIT');

      res.status(200).json({
        success: true,
        message: "Budget and all associated data deleted successfully"
      });

    } catch (err) {
      // Rollback the transaction on error
      await db.query('ROLLBACK');
      throw err;
    }

  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to delete budget. Please try again." 
    });
  }
};

/**
 * CATEGORY CONTROLLER
 */

// Add a new category
exports.addCategory = async (req, res) => {
  try {
    const { budgetID, categoryName, icon } = req.body;
    const userID = req.session.user.id;

    if (!budgetID || !categoryName) {
      return res.status(400).json({
        success: false,
        message: "Budget ID and category name are required",
      });
    }

    // First verify the budget exists and belongs to the user
    const checkBudgetQuery = `
      SELECT * FROM budgets WHERE budgetID = ? AND userID = ?
    `;

    const budgetResults = await db.query(checkBudgetQuery, [budgetID, userID]);

    if (budgetResults.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Budget not found or you don't have permission to add categories to it",
      });
    }

    // Check if category with same name exists in this budget
    const checkCategoryQuery = `
      SELECT * FROM categories 
      WHERE userID = ? AND budgetID = ? AND categoryName = ?
    `;

    const checkResults = await db.query(checkCategoryQuery, [
      userID,
      budgetID,
      categoryName,
    ]);

    if (checkResults.length > 0) {
      return res.status(400).json({
        success: false,
        message: "A category with this name already exists in this budget",
      });
    }

    // If all checks pass, insert the new category
    const insertQuery = `
      INSERT INTO categories (userID, budgetID, categoryName, categoryAmount, icon) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [
      userID,
      budgetID,
      categoryName,
      0.0,
      icon || "default-icon",
    ];

    const insertResult = await db.query(insertQuery, values);

    res.status(201).json({
      success: true,
      message: "Category added successfully!",
      data: {
        categoryID: insertResult.insertId,
        categoryName,
        budgetID,
        categoryAmount: 0,
        icon: icon || "default-icon",
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error adding category",
      error: err.message,
    });
  }
};

// Get all categories for a specific budget
exports.getCategories = async (req, res) => {
  try {
    const { budgetID } = req.params;
    const userID = req.session.user.id;

    const query = `
      SELECT * FROM categories 
      WHERE userID = ? AND budgetID = ?
    `;

    const results = await db.query(query, [userID, budgetID]);

    // Format the results
    const formattedResults = results.map((category) => ({
      ...category,
      categoryAmount: parseFloat(category.categoryAmount || 0),
    }));

    res.status(200).json({
      success: true,
      data: formattedResults,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
};

// Get a specific category
exports.getCategory = async (req, res) => {
  try {
    const { categoryID } = req.params;
    const userID = req.session.user.id;

    const query = `
      SELECT * FROM categories 
      WHERE categoryID = ? AND userID = ?
    `;

    const results = await db.query(query, [categoryID, userID]);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Format the result
    const category = {
      ...results[0],
      categoryAmount: parseFloat(results[0].categoryAmount || 0),
    };

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching category",
      error: error.message,
    });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { categoryID } = req.params;
    const { categoryName, icon } = req.body;
    const userID = req.session.user.id;

    if (!categoryName && !icon) {
      return res.status(400).json({
        success: false,
        message: "At least one field (categoryName or icon) is required",
      });
    }

    let updateQuery = "UPDATE categories SET ";
    const queryParams = [];

    if (categoryName) {
      updateQuery += "categoryName = ?";
      queryParams.push(categoryName);
    }

    if (icon) {
      if (categoryName) updateQuery += ", ";
      updateQuery += "icon = ?";
      queryParams.push(icon);
    }

    updateQuery += " WHERE categoryID = ? AND userID = ?";
    queryParams.push(categoryID, userID);

    const result = await db.query(updateQuery, queryParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found or you don't have permission to update it",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating category",
      error: error.message,
    });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  let connection = null;

  try {
    const { categoryID } = req.params;
    const userID = req.session.user.id;

    // Create a new connection for the transaction
    connection = await require("../db").createConnection();

    // Start a transaction
    await connection.beginTransaction();

    try {
      // First, delete all expenses associated with this category
      const deleteExpensesQuery = `
        DELETE FROM expenses 
        WHERE categoryID = ? AND userID = ?
      `;

      await connection.execute(deleteExpensesQuery, [categoryID, userID]);

      // Then delete the category
      const deleteCategoryQuery = `
        DELETE FROM categories 
        WHERE categoryID = ? AND userID = ?
      `;

      const [result] = await connection.execute(deleteCategoryQuery, [
        categoryID,
        userID,
      ]);

      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message:
            "Category not found or you don't have permission to delete it",
        });
      }

      // Commit the transaction
      await connection.commit();

      res.status(200).json({
        success: true,
        message: "Category and all associated expenses deleted successfully",
      });
    } catch (err) {
      // Rollback the transaction on error
      if (connection) {
        await connection.rollback();
      }
      throw err;
    }
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting category",
      error: error.message,
    });
  } finally {
    // Always close the connection
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
};

// Get categories filtered by time period
exports.getCategoriesForTimeFilter = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const { timeFilter } = req.query;

    let dateCondition = "";
    const queryParams = [userID];

    // Get current date for calculations
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Add date filtering based on timeFilter parameter
    if (timeFilter) {
      let startDate;

      switch (timeFilter) {
        case "thisMonth":
          // First day of current month to today
          startDate = new Date(currentYear, currentMonth, 1);
          dateCondition = " AND c.createdAt >= ?";
          queryParams.push(startDate);
          break;

        case "lastMonth":
          // First day of last month to last day of last month
          startDate = new Date(currentYear, currentMonth - 1, 1);
          const endDate = new Date(currentYear, currentMonth, 0);
          dateCondition = " AND c.createdAt >= ? AND c.createdAt <= ?";
          queryParams.push(startDate, endDate);
          break;

        case "thisYear":
          // First day of current year to today
          startDate = new Date(currentYear, 0, 1);
          dateCondition = " AND c.createdAt >= ?";
          queryParams.push(startDate);
          break;

        case "last12Months":
          // 12 months ago from today to today
          startDate = new Date(currentYear, currentMonth - 11, 1);
          dateCondition = " AND c.createdAt >= ?";
          queryParams.push(startDate);
          break;

        default:
          // No filter or invalid filter, return all categories
          break;
      }
    }

    // Query to get categories with their budget information
    const query = `
      SELECT 
        c.categoryID, 
        c.categoryName, 
        c.icon, 
        c.budgetID,
        COALESCE(c.categoryAmount, 0) AS categoryAmount,
        b.budgetName,
        b.targetAmount,
        b.icon as budgetIcon
      FROM categories c
      INNER JOIN budgets b ON c.budgetID = b.budgetID
      WHERE c.userID = ? AND b.userID = ?${dateCondition}
      ORDER BY b.budgetName, c.categoryName
    `;

    // Add userID twice for the JOIN condition
    queryParams.splice(1, 0, userID);

    const results = await db.query(query, queryParams);

    // Format the results
    const formattedResults = results.map((category) => ({
      ...category,
      categoryAmount: parseFloat(category.categoryAmount || 0),
      targetAmount: parseFloat(category.targetAmount || 0),
    }));

    res.status(200).json({
      success: true,
      data: formattedResults,
    });
  } catch (err) {
    console.error("Error fetching categories for time filter:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};