const db = require('../db'); // Adjust the path to your database configuration  

// Add a new category
exports.addCategory = (req, res) => {
  const { category, icon } = req.body;
  const userID = req.session.user.id; // Assuming session contains user object with id
  
  const query = `INSERT INTO categories (userID, categoryName, categoryAmount, icon) VALUES (?, ?, ?, ?)`;
  const values = [userID, category, 0.00, icon]; // Default categoryAmount to 0.00
  
  db.query(query, values, (error) => {
    if (error) {
      res.status(500).json({ success: false, message: "Error adding category", error });
    } else {
      res.status(201).json({ success: true, message: "Category added successfully!" });
    }
  });
};

exports.addExpense = (req, res) => {
  const { category, title, date, amount } = req.body;
  const userID = req.session.user.id;

  if (!title || !amount || !date) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const query = `INSERT INTO expenses (userID, categoryID, title, date, amount) VALUES (?, ?, ?, ?, ?)`;
  const values = [userID, category, title, date, amount];

  db.query(query, values, (error, results) => {
    if (error) {
      console.error("Error adding expense:", error);
      return res.status(500).json({ success: false, message: "Error adding expense", error });
    }

    // After successfully adding the expense, update the category's total amount
    const totalQuery = `SELECT SUM(amount) AS total FROM expenses WHERE categoryID = ?`;
    db.query(totalQuery, [category], (error, totalResults) => {
      if (error) {
        console.error("Error calculating total for category:", error);
        return res.status(500).json({ success: false, message: "Error updating category total", error });
      }

      const totalAmount = totalResults[0].total || 0.00; // Default to 0 if no expenses exist
      const updateCategoryQuery = `UPDATE categories SET categoryAmount = ? WHERE categoryID = ?`;
      db.query(updateCategoryQuery, [totalAmount, category], (error) => {
        if (error) {
          console.error("Error updating category amount:", error);
          return res.status(500).json({ success: false, message: "Error updating category amount", error });
        }

        // Confirm success
        res.status(201).json({ success: true, message: "Expense added and category updated!" });
      });
    });
  });
};

// Get all categories for logged-in user
exports.getCategories = (req, res) => {
  const userID = req.session.user.id;
  const query = `SELECT * FROM categories WHERE userID = ?`;
  
  db.query(query, [userID], (error, results) => {
    if (error) {
      res.status(500).json({ success: false, message: "Error fetching categories", error });
    } else {
      res.status(200).json({ success: true, data: results });
    }
  });
};

// Get all expenses for a specific category
exports.getCategoryExpenses = (req, res) => {
  const { categoryID } = req.params;
  const userID = req.session.user.id;
  
  const query = `SELECT * FROM expenses WHERE userID = ? AND categoryID = ?`;
  
  db.query(query, [userID, categoryID], (error, results) => {
    if (error) {
      res.status(500).json({ success: false, message: "Error fetching expenses for category", error });
    } else {
      res.status(200).json({ success: true, data: results });
    }
  });
};

// Update expense amount
exports.editExpense = (req, res) => {
  const { id } = req.params; // Expense ID to update
  const { amount } = req.body; // Updated amount
  
  const query = `UPDATE expenses SET amount = ? WHERE expenseID = ?`;
  
  db.query(query, [amount, id], (error) => {
    if (error) {
      res.status(500).json({ success: false, message: "Error updating expense", error });
    } else {
      res.status(200).json({ success: true, message: "Expense updated successfully!" });
    }
  });
};

// Get a specific category by ID
exports.getCategory = (req, res) => {
  const { id } = req.params;
  const userID = req.session.user.id;
  
  const query = `SELECT * FROM categories WHERE categoryID = ? AND userID = ?`;
  
  db.query(query, [id, userID], (error, results) => {
    if (error) {
      res.status(500).json({ success: false, message: "Error fetching category", error });
    } else if (results.length === 0) {
      res.status(404).json({ success: false, message: "Category not found" });
    } else {
      res.status(200).json({ success: true, data: results[0] });
    }
  });
};

// Delete a category
exports.deleteCategory = (req, res) => {
  const { id } = req.params; // Category ID to delete
  
  const query = `DELETE FROM categories WHERE categoryID = ?`;
  
  db.query(query, [id], (error) => {
    if (error) {
      return res.status(500).json({ success: false, message: "Error deleting category", error });
    } else {
      res.status(200).json({ success: true, message: "Category deleted successfully!" });
    }
  });
};

// Delete an expense
exports.deleteExpense = (req, res) => {
  const { id } = req.params; // Expense ID to delete
  
  // First, get the categoryID for this expense
  const getExpenseQuery = `SELECT categoryID FROM expenses WHERE expenseID = ?`;
  
  db.query(getExpenseQuery, [id], (error, expenseResults) => {
    if (error) {
      return res.status(500).json({ success: false, message: "Error getting expense details", error });
    }
    
    if (expenseResults.length === 0) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }
    
    const categoryID = expenseResults[0].categoryID;
    
    // Delete the expense
    const deleteQuery = `DELETE FROM expenses WHERE expenseID = ?`;
    
    db.query(deleteQuery, [id], (error) => {
      if (error) {
        return res.status(500).json({ success: false, message: "Error deleting expense", error });
      }
      
      // After successfully deleting the expense, update the category's total amount
      const totalQuery = `SELECT SUM(amount) AS total FROM expenses WHERE categoryID = ?`;
      db.query(totalQuery, [categoryID], (error, totalResults) => {
        if (error) {
          console.error("Error calculating total for category:", error);
          return res.status(500).json({ success: false, message: "Error updating category total", error });
        }

        const totalAmount = totalResults[0].total || 0.00; // Default to 0 if no expenses exist
        const updateCategoryQuery = `UPDATE categories SET categoryAmount = ? WHERE categoryID = ?`;
        db.query(updateCategoryQuery, [totalAmount, categoryID], (error) => {
          if (error) {
            console.error("Error updating category amount:", error);
            return res.status(500).json({ success: false, message: "Error updating category amount", error });
          }

          // Confirm success
          res.status(200).json({ success: true, message: "Expense deleted and category updated!" });
        });
      });
    });
  });
};