const db = require('../db');

// Add a new expense
exports.addExpense = (req, res) => {
  const { categoryID, title, date, amount } = req.body;
  const userID = req.session.user.id;

  if (!categoryID || !title || !amount || !date) {
    return res.status(400).json({ 
      success: false, 
      message: "All fields are required." 
    });
  }

  // Verify the category exists and belongs to the user
  const checkCategoryQuery = `
    SELECT c.*, b.budgetID 
    FROM categories c
    JOIN budgets b ON c.budgetID = b.budgetID
    WHERE c.categoryID = ? AND c.userID = ? AND b.userID = ?
  `;
  
  db.query(checkCategoryQuery, [categoryID, userID, userID], (checkErr, checkResults) => {
    if (checkErr) {
      console.error("Error checking category:", checkErr);
      return res.status(500).json({ 
        success: false, 
        message: "Error checking category", 
        error: checkErr.message 
      });
    }
    
    if (checkResults.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Category not found or you don't have permission to add expenses to it" 
      });
    }
    
    // Insert the expense
    const insertQuery = `
      INSERT INTO expenses (userID, categoryID, title, date, amount) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    db.query(insertQuery, [userID, categoryID, title, date, amount], (insertErr, insertResult) => {
      if (insertErr) {
        console.error("Error adding expense:", insertErr);
        return res.status(500).json({ 
          success: false, 
          message: "Error adding expense", 
          error: insertErr.message 
        });
      }
      
      // After successfully adding the expense, update the category's total amount
      const totalQuery = `
        SELECT SUM(amount) AS total 
        FROM expenses 
        WHERE categoryID = ? AND userID = ?
      `;
      
      db.query(totalQuery, [categoryID, userID], (totalErr, totalResults) => {
        if (totalErr) {
          console.error("Error calculating total for category:", totalErr);
          return res.status(500).json({ 
            success: false, 
            message: "Error updating category total", 
            error: totalErr.message 
          });
        }

        const totalAmount = totalResults[0].total || 0.00;
        
        // Update the category amount
        const updateCategoryQuery = `
          UPDATE categories 
          SET categoryAmount = ? 
          WHERE categoryID = ? AND userID = ?
        `;
        
        db.query(updateCategoryQuery, [totalAmount, categoryID, userID], (updateErr) => {
          if (updateErr) {
            console.error("Error updating category amount:", updateErr);
            return res.status(500).json({ 
              success: false, 
              message: "Error updating category amount", 
              error: updateErr.message 
            });
          }

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
              newCategoryTotal: parseFloat(totalAmount)
            }
          });
        });
      });
    });
  });
};

// Get all expenses for a specific category
exports.getCategoryExpenses = (req, res) => {
  const { categoryID } = req.params;
  const userID = req.session.user.id;
  
  // Verify the category exists and belongs to the user
  const checkCategoryQuery = `
    SELECT * FROM categories 
    WHERE categoryID = ? AND userID = ?
  `;
  
  db.query(checkCategoryQuery, [categoryID, userID], (checkErr, checkResults) => {
    if (checkErr) {
      return res.status(500).json({ 
        success: false, 
        message: "Error checking category", 
        error: checkErr.message 
      });
    }
    
    if (checkResults.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Category not found or you don't have permission to view its expenses" 
      });
    }
    
    // Get all expenses for this category
    const expensesQuery = `
      SELECT e.expenseID, e.title, DATE_FORMAT(e.date, '%Y-%m-%d') AS date, e.amount
      FROM expenses e
      WHERE e.categoryID = ? AND e.userID = ?
      ORDER BY e.date DESC
    `;
    
    db.query(expensesQuery, [categoryID, userID], (expensesErr, expensesResults) => {
      if (expensesErr) {
        return res.status(500).json({ 
          success: false, 
          message: "Error fetching expenses", 
          error: expensesErr.message 
        });
      }
      
      // Format the results
      const formattedResults = expensesResults.map(expense => ({
        ...expense,
        amount: parseFloat(expense.amount || 0)
      }));
      
      res.status(200).json({ 
        success: true, 
        data: formattedResults 
      });
    });
  });
};

// Get a specific expense
exports.getExpense = (req, res) => {
  const { expenseID } = req.params;
  const userID = req.session.user.id;
  
  const query = `
    SELECT e.expenseID, e.categoryID, e.title, DATE_FORMAT(e.date, '%Y-%m-%d') AS date, e.amount,
           c.categoryName, c.budgetID
    FROM expenses e
    JOIN categories c ON e.categoryID = c.categoryID
    WHERE e.expenseID = ? AND e.userID = ? AND c.userID = ?
  `;
  
  db.query(query, [expenseID, userID, userID], (error, results) => {
    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: "Error fetching expense", 
        error: error.message 
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Expense not found" 
      });
    }
    
    // Format the result
    const expense = {
      ...results[0],
      amount: parseFloat(results[0].amount || 0)
    };
    
    res.status(200).json({ 
      success: true, 
      data: expense 
    });
  });
};

// Update an expense
exports.updateExpense = (req, res) => {
  const { expenseID } = req.params;
  const { title, date, amount } = req.body;
  const userID = req.session.user.id;
  
  if (!title && !date && amount === undefined) {
    return res.status(400).json({ 
      success: false, 
      message: "At least one field (title, date, or amount) is required" 
    });
  }
  
  // First, get the expense details to ensure it belongs to the user and to get its category
  const getExpenseQuery = `
    SELECT * FROM expenses 
    WHERE expenseID = ? AND userID = ?
  `;
  
  db.query(getExpenseQuery, [expenseID, userID], (getErr, getResults) => {
    if (getErr) {
      console.error("Error fetching expense:", getErr);
      return res.status(500).json({ 
        success: false, 
        message: "Error getting expense details", 
        error: getErr.message 
      });
    }
    
    if (getResults.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Expense not found or you don't have permission to edit it" 
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
    db.query(updateQuery, queryParams, (updateErr, updateResult) => {
      if (updateErr) {
        console.error("Error updating expense:", updateErr);
        return res.status(500).json({ 
          success: false, 
          message: "Error updating expense", 
          error: updateErr.message 
        });
      }
      
      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ 
          success: false, 
          message: "Expense not found or you don't have permission to update it" 
        });
      }
      
      // If amount was updated, recalculate the category total
      if (amount !== undefined) {
        const totalQuery = `
          SELECT SUM(amount) AS total 
          FROM expenses 
          WHERE categoryID = ? AND userID = ?
        `;
        
        db.query(totalQuery, [categoryID, userID], (totalErr, totalResults) => {
          if (totalErr) {
            console.error("Error calculating total for category:", totalErr);
            return res.status(500).json({ 
              success: false, 
              message: "Error updating category total", 
              error: totalErr.message 
            });
          }
  
          const totalAmount = totalResults[0].total || 0.00;
          
          // Update the category amount
          const updateCategoryQuery = `
            UPDATE categories 
            SET categoryAmount = ? 
            WHERE categoryID = ? AND userID = ?
          `;
          
          db.query(updateCategoryQuery, [totalAmount, categoryID, userID], (categoryErr) => {
            if (categoryErr) {
              console.error("Error updating category amount:", categoryErr);
              return res.status(500).json({ 
                success: false, 
                message: "Error updating category amount", 
                error: categoryErr.message 
              });
            }
  
            res.status(200).json({ 
              success: true, 
              message: "Expense updated successfully!",
              data: {
                amountDiff: amount !== undefined ? parseFloat(amount) - oldAmount : 0,
                newCategoryTotal: parseFloat(totalAmount)
              }
            });
          });
        });
      } else {
        // If amount wasn't updated, just return success
        res.status(200).json({ 
          success: true, 
          message: "Expense updated successfully!" 
        });
      }
    });
  });
};

// Delete an expense
exports.deleteExpense = (req, res) => {
  const { expenseID } = req.params;
  const userID = req.session.user.id;
  
  // First, get the expense details to ensure it belongs to the user and to get its category
  const getExpenseQuery = `
    SELECT * FROM expenses 
    WHERE expenseID = ? AND userID = ?
  `;
  
  db.query(getExpenseQuery, [expenseID, userID], (getErr, getResults) => {
    if (getErr) {
      console.error("Error fetching expense:", getErr);
      return res.status(500).json({ 
        success: false, 
        message: "Error getting expense details", 
        error: getErr.message 
      });
    }
    
    if (getResults.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Expense not found or you don't have permission to delete it" 
      });
    }
    
    const categoryID = getResults[0].categoryID;
    
    // Delete the expense
    const deleteQuery = `
      DELETE FROM expenses 
      WHERE expenseID = ? AND userID = ?
    `;
    
    db.query(deleteQuery, [expenseID, userID], (deleteErr, deleteResult) => {
      if (deleteErr) {
        console.error("Error deleting expense:", deleteErr);
        return res.status(500).json({ 
          success: false, 
          message: "Error deleting expense", 
          error: deleteErr.message 
        });
      }
      
      // Recalculate the category total after deletion
      const totalQuery = `
        SELECT SUM(amount) AS total 
        FROM expenses 
        WHERE categoryID = ? AND userID = ?
      `;
      
      db.query(totalQuery, [categoryID, userID], (totalErr, totalResults) => {
        if (totalErr) {
          console.error("Error calculating total for category:", totalErr);
          return res.status(500).json({ 
            success: false, 
            message: "Error updating category total", 
            error: totalErr.message 
          });
        }

        const totalAmount = totalResults[0].total || 0.00;
        
        // Update the category amount
        const updateCategoryQuery = `
          UPDATE categories 
          SET categoryAmount = ? 
          WHERE categoryID = ? AND userID = ?
        `;
        
        db.query(updateCategoryQuery, [totalAmount, categoryID, userID], (categoryErr) => {
          if (categoryErr) {
            console.error("Error updating category amount:", categoryErr);
            return res.status(500).json({ 
              success: false, 
              message: "Error updating category amount", 
              error: categoryErr.message 
            });
          }

          res.status(200).json({ 
            success: true, 
            message: "Expense deleted successfully!",
            data: {
              newCategoryTotal: parseFloat(totalAmount)
            }
          });
        });
      });
    });
  });
};