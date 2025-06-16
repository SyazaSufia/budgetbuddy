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

// Helper function to get monthly expense total
const getMonthlyExpenseTotal = async (userID, month, year, excludeExpenseID = null) => {
  let query = `
    SELECT SUM(amount) as totalExpenses
    FROM expenses
    WHERE userID = ? 
      AND MONTH(date) = ? 
      AND YEAR(date) = ?
  `;
  
  const params = [userID, month, year];
  
  if (excludeExpenseID) {
    query += " AND expenseID != ?";
    params.push(excludeExpenseID);
  }
  
  const results = await db.query(query, params);
  return parseFloat(results[0]?.totalExpenses || 0);
};

// NEW: Validate expense addition against income
exports.validateExpenseAddition = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const { categoryID, amount, date } = req.body;

    if (!categoryID || !amount || !date) {
      return res.status(400).json({
        success: false,
        message: "Category ID, amount, and date are required."
      });
    }

    // Get the month and year from expense date
    const expenseDate = new Date(date);
    const expenseMonth = expenseDate.getMonth() + 1;
    const expenseYear = expenseDate.getFullYear();

    // Check if user has income for the expense month
    const monthlyIncome = await getMonthlyIncomeTotal(userID, expenseMonth, expenseYear);
    
    if (monthlyIncome <= 0) {
      return res.status(400).json({
        success: false,
        message: "You must add income for this month before adding expenses.",
        code: "NO_INCOME"
      });
    }

    // Get current month's total expenses
    const currentExpenseTotal = await getMonthlyExpenseTotal(userID, expenseMonth, expenseYear);
    
    // Check if new expense would exceed income
    const newTotalExpense = currentExpenseTotal + parseFloat(amount);
    
    if (newTotalExpense > monthlyIncome) {
      return res.status(400).json({
        success: false,
        message: `Total expenses (RM ${newTotalExpense.toFixed(2)}) would exceed your monthly income (RM ${monthlyIncome.toFixed(2)}). Available spending: RM ${(monthlyIncome - currentExpenseTotal).toFixed(2)}`,
        code: "EXCEEDS_INCOME",
        data: {
          monthlyIncome,
          currentExpenseTotal,
          requestedAmount: parseFloat(amount),
          availableSpending: monthlyIncome - currentExpenseTotal
        }
      });
    }

    // Validation passed
    res.status(200).json({
      success: true,
      message: "Expense can be added.",
      data: {
        monthlyIncome,
        currentExpenseTotal,
        requestedAmount: parseFloat(amount),
        remainingIncome: monthlyIncome - newTotalExpense
      }
    });

  } catch (err) {
    console.error("Error validating expense addition:", err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to validate expense addition." 
    });
  }
};

// NEW: Get monthly expense summary
exports.getMonthlyExpenseSummary = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const { month, year } = req.query;

    // If no month/year provided, use current month/year
    const now = new Date();
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year) : now.getFullYear();

    // Get monthly income
    const monthlyIncome = await getMonthlyIncomeTotal(userID, targetMonth, targetYear);
    
    // Get monthly expense total
    const monthlyExpenseTotal = await getMonthlyExpenseTotal(userID, targetMonth, targetYear);

    res.status(200).json({
      success: true,
      data: {
        monthlyIncome,
        monthlyExpenseTotal,
        remainingIncome: monthlyIncome - monthlyExpenseTotal,
        month: targetMonth,
        year: targetYear
      }
    });

  } catch (err) {
    console.error("Error getting monthly expense summary:", err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to get monthly expense summary." 
    });
  }
};

// Add a new expense - UPDATED with validation
exports.addExpense = async (req, res) => {
  try {
    const { categoryID, title, date, amount } = req.body;
    const userID = req.session.user.id;

    if (!categoryID || !title || !amount || !date) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Get the month and year from expense date
    const expenseDate = new Date(date);
    const expenseMonth = expenseDate.getMonth() + 1;
    const expenseYear = expenseDate.getFullYear();

    // Check if user has income for the expense month
    const monthlyIncome = await getMonthlyIncomeTotal(userID, expenseMonth, expenseYear);
    
    if (monthlyIncome <= 0) {
      return res.status(400).json({
        success: false,
        message: "You must add income for this month before adding expenses.",
        code: "NO_INCOME"
      });
    }

    // Get current month's total expenses
    const currentExpenseTotal = await getMonthlyExpenseTotal(userID, expenseMonth, expenseYear);
    
    // Check if new expense would exceed income
    const newTotalExpense = currentExpenseTotal + parseFloat(amount);
    
    if (newTotalExpense > monthlyIncome) {
      return res.status(400).json({
        success: false,
        message: `Total expenses (RM ${newTotalExpense.toFixed(2)}) would exceed your monthly income (RM ${monthlyIncome.toFixed(2)}). Available spending: RM ${(monthlyIncome - currentExpenseTotal).toFixed(2)}`,
        code: "EXCEEDS_INCOME",
        data: {
          monthlyIncome,
          currentExpenseTotal,
          requestedAmount: parseFloat(amount),
          availableSpending: monthlyIncome - currentExpenseTotal
        }
      });
    }

    // Verify the category exists and belongs to the user
    const checkCategoryQuery = `
      SELECT c.*, b.budgetID 
      FROM categories c
      JOIN budgets b ON c.budgetID = b.budgetID
      WHERE c.categoryID = ? AND c.userID = ? AND b.userID = ?
    `;

    const checkResults = await db.query(checkCategoryQuery, [
      categoryID,
      userID,
      userID,
    ]);

    if (checkResults.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Category not found or you don't have permission to add expenses to it",
      });
    }

    // Insert the expense
    const insertQuery = `
      INSERT INTO expenses (userID, categoryID, title, date, amount) 
      VALUES (?, ?, ?, ?, ?)
    `;

    const insertResult = await db.query(insertQuery, [
      userID,
      categoryID,
      title,
      date,
      amount,
    ]);

    // After successfully adding the expense, update the category's total amount
    const totalQuery = `
      SELECT SUM(amount) AS total 
      FROM expenses 
      WHERE categoryID = ? AND userID = ?
    `;

    const totalResults = await db.query(totalQuery, [categoryID, userID]);
    const totalAmount = totalResults[0].total || 0.0;

    // Update the category amount
    const updateCategoryQuery = `
      UPDATE categories 
      SET categoryAmount = ? 
      WHERE categoryID = ? AND userID = ?
    `;

    await db.query(updateCategoryQuery, [totalAmount, categoryID, userID]);

    // Return the newly created expense
    res.status(201).json({
      success: true,
      message: "Expense added successfully!",
      data: {
        expenseID: insertResult.insertId,
        categoryID,
        title,
        date,
        amount: parseFloat(amount),
        newCategoryTotal: parseFloat(totalAmount),
      },
    });
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({
      success: false,
      message: "Error adding expense",
      error: error.message,
    });
  }
};

// Get all expenses for a specific category
exports.getCategoryExpenses = async (req, res) => {
  try {
    const { categoryID } = req.params;
    const userID = req.session.user.id;

    // Verify the category exists and belongs to the user
    const checkCategoryQuery = `
      SELECT * FROM categories 
      WHERE categoryID = ? AND userID = ?
    `;

    const checkResults = await db.query(checkCategoryQuery, [
      categoryID,
      userID,
    ]);

    if (checkResults.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Category not found or you don't have permission to view its expenses",
      });
    }

    // Get all expenses for this category
    const expensesQuery = `
      SELECT e.expenseID, e.title, DATE_FORMAT(e.date, '%Y-%m-%d') AS date, e.amount
      FROM expenses e
      WHERE e.categoryID = ? AND e.userID = ?
      ORDER BY e.date DESC
    `;

    const expensesResults = await db.query(expensesQuery, [categoryID, userID]);

    // Format the results
    const formattedResults = expensesResults.map((expense) => ({
      ...expense,
      amount: parseFloat(expense.amount || 0),
    }));

    res.status(200).json({
      success: true,
      data: formattedResults,
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching expenses",
      error: error.message,
    });
  }
};

// Get a specific expense
exports.getExpense = async (req, res) => {
  try {
    const { expenseID } = req.params;
    const userID = req.session.user.id;

    const query = `
      SELECT e.expenseID, e.categoryID, e.title, DATE_FORMAT(e.date, '%Y-%m-%d') AS date, e.amount,
             c.categoryName, c.budgetID
      FROM expenses e
      JOIN categories c ON e.categoryID = c.categoryID
      WHERE e.expenseID = ? AND e.userID = ? AND c.userID = ?
    `;

    const results = await db.query(query, [expenseID, userID, userID]);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // Format the result
    const expense = {
      ...results[0],
      amount: parseFloat(results[0].amount || 0),
    };

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error("Error fetching expense:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching expense",
      error: error.message,
    });
  }
};

// Update an expense - UPDATED with validation
exports.updateExpense = async (req, res) => {
  try {
    const { expenseID } = req.params;
    const { title, date, amount } = req.body;
    const userID = req.session.user.id;

    if (!title && !date && amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "At least one field (title, date, or amount) is required",
      });
    }

    // First, get the expense details to ensure it belongs to the user and to get its category
    const getExpenseQuery = `
      SELECT * FROM expenses 
      WHERE expenseID = ? AND userID = ?
    `;

    const getResults = await db.query(getExpenseQuery, [expenseID, userID]);

    if (getResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Expense not found or you don't have permission to edit it",
      });
    }

    const oldAmount = parseFloat(getResults[0].amount);
    const categoryID = getResults[0].categoryID;
    const oldDate = getResults[0].date;

    // If amount or date is being updated, validate against income
    if (amount !== undefined || date) {
      const targetDate = date ? new Date(date) : new Date(oldDate);
      const targetAmount = amount !== undefined ? parseFloat(amount) : oldAmount;
      
      const expenseMonth = targetDate.getMonth() + 1;
      const expenseYear = targetDate.getFullYear();

      // Check if user has income for the expense month
      const monthlyIncome = await getMonthlyIncomeTotal(userID, expenseMonth, expenseYear);
      
      if (monthlyIncome <= 0) {
        return res.status(400).json({
          success: false,
          message: "You must add income for this month before updating expenses.",
          code: "NO_INCOME"
        });
      }

      // Get current month's total expenses (excluding this expense)
      const currentExpenseTotal = await getMonthlyExpenseTotal(userID, expenseMonth, expenseYear, expenseID);
      
      // Check if updated expense would exceed income
      const newTotalExpense = currentExpenseTotal + targetAmount;
      
      if (newTotalExpense > monthlyIncome) {
        return res.status(400).json({
          success: false,
          message: `Updated expenses (RM ${newTotalExpense.toFixed(2)}) would exceed your monthly income (RM ${monthlyIncome.toFixed(2)}). Available spending: RM ${(monthlyIncome - currentExpenseTotal).toFixed(2)}`,
          code: "EXCEEDS_INCOME",
          data: {
            monthlyIncome,
            currentExpenseTotal,
            requestedAmount: targetAmount,
            availableSpending: monthlyIncome - currentExpenseTotal
          }
        });
      }
    }

    // Build the update query
    let updateQuery = "UPDATE expenses SET ";
    const queryParams = [];

    if (title) {
      updateQuery += "title = ?";
      queryParams.push(title);
    }

    if (date) {
      if (title) updateQuery += ", ";
      updateQuery += "date = ?";
      queryParams.push(date);
    }

    if (amount !== undefined) {
      if (title || date) updateQuery += ", ";
      updateQuery += "amount = ?";
      queryParams.push(amount);
    }

    updateQuery += " WHERE expenseID = ? AND userID = ?";
    queryParams.push(expenseID, userID);

    // Update the expense
    const updateResult = await db.query(updateQuery, queryParams);

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Expense not found or you don't have permission to update it",
      });
    }

    // If amount was updated, recalculate the category total
    if (amount !== undefined) {
      const totalQuery = `
        SELECT SUM(amount) AS total 
        FROM expenses 
        WHERE categoryID = ? AND userID = ?
      `;

      const totalResults = await db.query(totalQuery, [categoryID, userID]);
      const totalAmount = totalResults[0].total || 0.0;

      // Update the category amount
      const updateCategoryQuery = `
        UPDATE categories 
        SET categoryAmount = ? 
        WHERE categoryID = ? AND userID = ?
      `;

      await db.query(updateCategoryQuery, [totalAmount, categoryID, userID]);

      res.status(200).json({
        success: true,
        message: "Expense updated successfully!",
        data: {
          amountDiff: amount !== undefined ? parseFloat(amount) - oldAmount : 0,
          newCategoryTotal: parseFloat(totalAmount),
        },
      });
    } else {
      // If amount wasn't updated, just return success
      res.status(200).json({
        success: true,
        message: "Expense updated successfully!",
      });
    }
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({
      success: false,
      message: "Error updating expense",
      error: error.message,
    });
  }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
  try {
    const { expenseID } = req.params;
    const userID = req.session.user.id;

    // First, get the expense details to ensure it belongs to the user and to get its category
    const getExpenseQuery = `
      SELECT * FROM expenses 
      WHERE expenseID = ? AND userID = ?
    `;

    const getResults = await db.query(getExpenseQuery, [expenseID, userID]);

    if (getResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Expense not found or you don't have permission to delete it",
      });
    }

    const categoryID = getResults[0].categoryID;

    // Delete the expense
    const deleteQuery = `
      DELETE FROM expenses 
      WHERE expenseID = ? AND userID = ?
    `;

    await db.query(deleteQuery, [expenseID, userID]);

    // Recalculate the category total after deletion
    const totalQuery = `
      SELECT SUM(amount) AS total 
      FROM expenses 
      WHERE categoryID = ? AND userID = ?
    `;

    const totalResults = await db.query(totalQuery, [categoryID, userID]);
    const totalAmount = totalResults[0].total || 0.0;

    // Update the category amount
    const updateCategoryQuery = `
      UPDATE categories 
      SET categoryAmount = ? 
      WHERE categoryID = ? AND userID = ?
    `;

    await db.query(updateCategoryQuery, [totalAmount, categoryID, userID]);

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully!",
      data: {
        newCategoryTotal: parseFloat(totalAmount),
      },
    });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting expense",
      error: error.message,
    });
  }
};