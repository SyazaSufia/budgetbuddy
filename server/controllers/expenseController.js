const db = require("../db");

// Add a new expense
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

// Update an expense
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
