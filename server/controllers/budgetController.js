const db = require("../db");

// Get all budgets for logged-in user
exports.getBudgets = (req, res) => {
  const userID = req.session.user.id;

  const query = `
    SELECT b.budgetID, b.categoryID, c.categoryName, c.icon, 
    COALESCE(c.categoryAmount, 0) as categoryAmount,
    b.targetAmount
    FROM budgets b
    JOIN categories c ON b.categoryID = c.categoryID
    WHERE b.userID = ?
  `;

  db.query(query, [userID], (err, results) => {
    if (err)
      return res.status(500).json({ success: false, error: err.message });

    // Ensure numeric values are properly formatted
    const formattedResults = results.map((budget) => ({
      ...budget,
      categoryAmount: parseFloat(budget.categoryAmount || 0),
      targetAmount: parseFloat(budget.targetAmount || 2000),
    }));

    res.status(200).json({ success: true, data: formattedResults });
  });
};

// Get specific budget details including history
exports.getBudgetDetails = (req, res) => {
  const userID = req.session.user.id;
  const { budgetID } = req.params;

  if (!req.session || !req.session.user) {
    console.log("Authentication failed: No session or user");
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  // Get budget and category information
  const budgetQuery = `
    SELECT 
    b.budgetID, 
    b.categoryID, 
    c.categoryName, 
    c.icon, 
    COALESCE(c.categoryAmount, 0) AS categoryAmount,
    b.targetAmount
FROM budgets b
LEFT JOIN categories c 
    ON b.categoryID = c.categoryID AND c.userID = ?
WHERE b.userID = ? AND b.budgetID = ?
  `;

  // Get expense history for this category
  const historyQuery = `
    SELECT e.expenseID, e.amount, DATE_FORMAT(e.date, '%d-%m-%Y') AS date
    FROM expenses e
    WHERE e.userID = ? AND e.categoryID = (
      SELECT categoryID FROM budgets WHERE budgetID = ? AND userID = ?
    )
    ORDER BY e.date DESC
  `;

  db.query(budgetQuery, [userID, userID, budgetID], (err, budgetResults) => {
    if (err) {
      console.error("Database error:", err);  // Enhanced error logging
      return res.status(500).json({ success: false, error: err.message });
    }

    if (budgetResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    const budget = {
      ...budgetResults[0],
      categoryAmount: parseFloat(budgetResults[0].categoryAmount || 0),
      targetAmount: parseFloat(budgetResults[0].targetAmount || 2000),
    };

    db.query(
      historyQuery,
      [userID, budgetID, userID],
      (historyErr, historyResults) => {
        if (historyErr) {
          console.error("History query error:", historyErr);  // Enhanced error logging
          return res
            .status(500)
            .json({ success: false, error: historyErr.message });
        }

        // Format history items
        const formattedHistory = historyResults.map((item) => ({
          ...item,
          amount: parseFloat(item.amount || 0),
        }));

        res.status(200).json({
          success: true,
          data: {
            budget: budget,
            history: formattedHistory,
          },
        });
      }
    );
  });
};

// Create a new budget
exports.createBudget = (req, res) => {
  const userID = req.session.user.id;
  const { categoryID, targetAmount = 2000 } = req.body;  // Allow custom targetAmount

  // Check if a budget for this category already exists for this user
  const checkQuery = `
    SELECT * FROM budgets WHERE userID = ? AND categoryID = ?
  `;

  db.query(checkQuery, [userID, categoryID], (checkErr, checkResults) => {
    if (checkErr)
      return res.status(500).json({ success: false, error: checkErr.message });

    if (checkResults.length > 0) {
      return res.status(400).json({
        success: false,
        message: "A budget already exists for this category.",
      });
    }

    // If not exists, proceed to insert
    const insertQuery = `INSERT INTO budgets (userID, categoryID, targetAmount) VALUES (?, ?, ?)`;
    db.query(insertQuery, [userID, categoryID, targetAmount], (err, result) => {
      if (err)
        return res.status(500).json({ success: false, error: err.message });

      // Fetch the newly created budget with category data
      const fetchQuery = `
        SELECT b.budgetID, b.categoryID, c.categoryName, c.icon, 
        COALESCE(c.categoryAmount, 0) as categoryAmount,
        b.targetAmount
        FROM budgets b
        JOIN categories c ON b.categoryID = c.categoryID
        WHERE b.budgetID = ?
      `;

      db.query(fetchQuery, [result.insertId], (fetchErr, fetchResults) => {
        if (fetchErr)
          return res
            .status(500)
            .json({ success: false, error: fetchErr.message });

        const newBudget =
          fetchResults.length > 0
            ? {
                ...fetchResults[0],
                categoryAmount: parseFloat(fetchResults[0].categoryAmount || 0),
                targetAmount: parseFloat(fetchResults[0].targetAmount || 2000),
              }
            : null;

        res.status(201).json({
          success: true,
          insertId: result.insertId,
          budget: newBudget,
        });
      });
    });
  });
};

// Update a budget's target amount
exports.updateBudgetTarget = (req, res) => {
  const userID = req.session.user.id;
  const { budgetID } = req.params;
  const { targetAmount } = req.body;

  if (!targetAmount) {
    return res.status(400).json({
      success: false,
      message: "Target amount is required"
    });
  }

  const updateQuery = `
    UPDATE budgets 
    SET targetAmount = ? 
    WHERE budgetID = ? AND userID = ?
  `;

  db.query(updateQuery, [targetAmount, budgetID, userID], (err, result) => {
    if (err) {
      console.error("Update error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Budget not found or you don't have permission to update it"
      });
    }

    res.status(200).json({
      success: true,
      message: "Budget target amount updated successfully"
    });
  });
};

// Delete a budget
exports.deleteBudget = (req, res) => {
  const userID = req.session.user.id;
  const { budgetID } = req.params;

  const deleteQuery = `
    DELETE FROM budgets 
    WHERE budgetID = ? AND userID = ?
  `;

  db.query(deleteQuery, [budgetID, userID], (err, result) => {
    if (err) {
      console.error("Delete error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Budget not found or you don't have permission to delete it"
      });
    }

    res.status(200).json({
      success: true,
      message: "Budget deleted successfully"
    });
  });
};

// Get budget by category ID
exports.getBudgetByCategory = (req, res) => {
  const userID = req.session.user.id;
  const { categoryID } = req.params;

  const query = `
    SELECT b.budgetID, b.categoryID, c.categoryName, c.icon, 
    COALESCE(c.categoryAmount, 0) as categoryAmount,
    b.targetAmount
    FROM budgets b
    JOIN categories c ON b.categoryID = c.categoryID
    WHERE b.userID = ? AND b.categoryID = ?
  `;

  db.query(query, [userID, categoryID], (err, results) => {
    if (err)
      return res.status(500).json({ success: false, error: err.message });

    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No budget found for this category" 
      });
    }

    // Format the numeric values
    const formattedResult = {
      ...results[0],
      categoryAmount: parseFloat(results[0].categoryAmount || 0),
      targetAmount: parseFloat(results[0].targetAmount || 0),
    };

    res.status(200).json({ success: true, data: formattedResult });
  });
};