const db = require("../db");

// Get all budgets for logged-in user
exports.getBudgets = (req, res) => {
  const userID = req.session.user.id;

  const query = `
    SELECT b.budgetID, b.budgetName, b.targetAmount, b.icon
    FROM budgets b
    WHERE b.userID = ?
  `;

  db.query(query, [userID], (err, results) => {
    if (err)
      return res.status(500).json({ success: false, error: err.message });

    // Ensure numeric values are properly formatted
    const formattedResults = results.map((budget) => ({
      ...budget,
      targetAmount: parseFloat(budget.targetAmount || 2000),
    }));

    res.status(200).json({ success: true, data: formattedResults });
  });
};

// Get specific budget details including categories and their expenses
exports.getBudgetDetails = (req, res) => {
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

  db.query(budgetQuery, [userID, budgetID], (err, budgetResults) => {
    if (err) {
      console.error("Database error:", err);
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
      targetAmount: parseFloat(budgetResults[0].targetAmount || 2000),
    };

    db.query(categoriesQuery, [userID, budgetID], (categoryErr, categoryResults) => {
      if (categoryErr) {
        console.error("Category query error:", categoryErr);
        return res.status(500).json({ success: false, error: categoryErr.message });
      }

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
    });
  });
};

// Create a new budget
exports.createBudget = (req, res) => {
  const userID = req.session.user.id;
  const { budgetName, targetAmount = 2000, icon } = req.body;

  if (!budgetName) {
    return res.status(400).json({
      success: false,
      message: "Budget name is required.",
    });
  }

  // Check if a budget with this name already exists for this user
  const checkQuery = `
    SELECT * FROM budgets WHERE userID = ? AND budgetName = ?
  `;

  db.query(checkQuery, [userID, budgetName], (checkErr, checkResults) => {
    if (checkErr)
      return res.status(500).json({ success: false, error: checkErr.message });

    if (checkResults.length > 0) {
      return res.status(400).json({
        success: false,
        message: "A budget with this name already exists.",
      });
    }

    // If not exists, proceed to insert
    const insertQuery = `INSERT INTO budgets (userID, budgetName, targetAmount, icon) VALUES (?, ?, ?, ?)`;
    db.query(insertQuery, [userID, budgetName, targetAmount, icon], (err, result) => {
      if (err)
        return res.status(500).json({ success: false, error: err.message });

      res.status(201).json({
        success: true,
        data: {
          budgetID: result.insertId,
          budgetName,
          targetAmount: parseFloat(targetAmount),
          icon
        },
        message: "Budget created successfully!"
      });
    });
  });
};

// Update a budget's details
exports.updateBudget = (req, res) => {
  const userID = req.session.user.id;
  const { budgetID } = req.params;
  const { budgetName, targetAmount, icon } = req.body;

  if (!budgetName && !targetAmount && !icon) {
    return res.status(400).json({
      success: false,
      message: "At least one field (budgetName, targetAmount, or icon) is required"
    });
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

  db.query(updateQuery, queryParams, (err, result) => {
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
      message: "Budget updated successfully"
    });
  });
};

// Delete a budget
exports.deleteBudget = (req, res) => {
  const userID = req.session.user.id;
  const { budgetID } = req.params;

  // First check if there are any categories associated with this budget
  const checkCategoriesQuery = `
    SELECT COUNT(*) as categoryCount 
    FROM categories 
    WHERE budgetID = ? AND userID = ?
  `;

  db.query(checkCategoriesQuery, [budgetID, userID], (checkErr, checkResults) => {
    if (checkErr) {
      console.error("Check categories error:", checkErr);
      return res.status(500).json({ success: false, error: checkErr.message });
    }

    const categoryCount = checkResults[0].categoryCount;
    
    if (categoryCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete budget with associated categories. Delete categories first."
      });
    }

    // If no categories exist, proceed with deletion
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
  });
};

/**
 * CATEGORY CONTROLLER
 */

// Add a new category
exports.addCategory = (req, res) => {
  const { budgetID, categoryName, icon } = req.body;
  const userID = req.session.user.id;
  
  if (!budgetID || !categoryName) {
    return res.status(400).json({ 
      success: false, 
      message: "Budget ID and category name are required" 
    });
  }

  // First verify the budget exists and belongs to the user
  const checkBudgetQuery = `
    SELECT * FROM budgets WHERE budgetID = ? AND userID = ?
  `;
  
  db.query(checkBudgetQuery, [budgetID, userID], (budgetErr, budgetResults) => {
    if (budgetErr) {
      return res.status(500).json({ 
        success: false, 
        message: "Error checking budget", 
        error: budgetErr.message 
      });
    }
    
    if (budgetResults.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Budget not found or you don't have permission to add categories to it" 
      });
    }
    
    // Check if category with same name exists in this budget
    const checkCategoryQuery = `
      SELECT * FROM categories 
      WHERE userID = ? AND budgetID = ? AND categoryName = ?
    `;
    
    db.query(checkCategoryQuery, [userID, budgetID, categoryName], (checkErr, checkResults) => {
      if (checkErr) {
        return res.status(500).json({ 
          success: false, 
          message: "Error checking category", 
          error: checkErr.message 
        });
      }
      
      if (checkResults.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: "A category with this name already exists in this budget" 
        });
      }
      
      // If all checks pass, insert the new category
      const insertQuery = `
        INSERT INTO categories (userID, budgetID, categoryName, categoryAmount, icon) 
        VALUES (?, ?, ?, ?, ?)
      `;
      const values = [userID, budgetID, categoryName, 0.00, icon || 'default-icon'];
      
      db.query(insertQuery, values, (insertErr, insertResult) => {
        if (insertErr) {
          return res.status(500).json({ 
            success: false, 
            message: "Error adding category", 
            error: insertErr.message 
          });
        }
        
        res.status(201).json({ 
          success: true, 
          message: "Category added successfully!",
          data: {
            categoryID: insertResult.insertId,
            categoryName,
            budgetID,
            categoryAmount: 0,
            icon: icon || 'default-icon'
          }
        });
      });
    });
  });
};

// Get all categories for a specific budget
exports.getCategories = (req, res) => {
  const { budgetID } = req.params;
  const userID = req.session.user.id;
  
  const query = `
    SELECT * FROM categories 
    WHERE userID = ? AND budgetID = ?
  `;
  
  db.query(query, [userID, budgetID], (error, results) => {
    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: "Error fetching categories", 
        error: error.message 
      });
    }
    
    // Format the results
    const formattedResults = results.map(category => ({
      ...category,
      categoryAmount: parseFloat(category.categoryAmount || 0)
    }));
    
    res.status(200).json({ 
      success: true, 
      data: formattedResults 
    });
  });
};

// Get a specific category
exports.getCategory = (req, res) => {
  const { categoryID } = req.params;
  const userID = req.session.user.id;
  
  const query = `
    SELECT * FROM categories 
    WHERE categoryID = ? AND userID = ?
  `;
  
  db.query(query, [categoryID, userID], (error, results) => {
    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: "Error fetching category", 
        error: error.message 
      });
    } 
    
    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Category not found" 
      });
    }
    
    // Format the result
    const category = {
      ...results[0],
      categoryAmount: parseFloat(results[0].categoryAmount || 0)
    };
    
    res.status(200).json({ 
      success: true, 
      data: category 
    });
  });
};

// Update a category
exports.updateCategory = (req, res) => {
  const { categoryID } = req.params;
  const { categoryName, icon } = req.body;
  const userID = req.session.user.id;
  
  if (!categoryName && !icon) {
    return res.status(400).json({ 
      success: false, 
      message: "At least one field (categoryName or icon) is required" 
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
  
  db.query(updateQuery, queryParams, (error, result) => {
    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: "Error updating category", 
        error: error.message 
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Category not found or you don't have permission to update it" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Category updated successfully" 
    });
  });
};

// Delete a category
exports.deleteCategory = (req, res) => {
  const { categoryID } = req.params;
  const userID = req.session.user.id;
  
  // First check if there are any expenses associated with this category
  const checkExpensesQuery = `
    SELECT COUNT(*) as expenseCount 
    FROM expenses 
    WHERE categoryID = ? AND userID = ?
  `;
  
  db.query(checkExpensesQuery, [categoryID, userID], (checkErr, checkResults) => {
    if (checkErr) {
      return res.status(500).json({ 
        success: false, 
        message: "Error checking expenses", 
        error: checkErr.message 
      });
    }
    
    const expenseCount = checkResults[0].expenseCount;
    
    if (expenseCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot delete category with associated expenses. Delete expenses first." 
      });
    }
    
    // If no expenses exist, proceed with deletion
    const deleteQuery = `
      DELETE FROM categories 
      WHERE categoryID = ? AND userID = ?
    `;
    
    db.query(deleteQuery, [categoryID, userID], (error, result) => {
      if (error) {
        return res.status(500).json({ 
          success: false, 
          message: "Error deleting category", 
          error: error.message 
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          success: false, 
          message: "Category not found or you don't have permission to delete it" 
        });
      }
      
      res.status(200).json({ 
        success: true, 
        message: "Category deleted successfully" 
      });
    });
  });
};