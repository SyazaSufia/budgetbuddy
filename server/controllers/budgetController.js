const db = require("../db");

// Get all budgets for logged-in user
exports.getBudgets = (req, res) => {
  const userID = req.session.user.id;

  const query = `
    SELECT b.budgetID, b.categoryID, c.categoryName, c.icon 
    FROM budgets b
    JOIN categories c ON b.categoryID = c.categoryID
    WHERE b.userID = ?
  `;

  db.query(query, [userID], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err });
    res.status(200).json({ success: true, data: results });
  });
};

// Create a new budget
exports.createBudget = (req, res) => {
  const userID = req.session.user.id;
  const { categoryID } = req.body;

  // Check if a budget for this category already exists for this user
  const checkQuery = `
    SELECT * FROM budgets WHERE userID = ? AND categoryID = ?
  `;

  db.query(checkQuery, [userID, categoryID], (checkErr, checkResults) => {
    if (checkErr) return res.status(500).json({ success: false, error: checkErr });

    if (checkResults.length > 0) {
      return res.status(400).json({
        success: false,
        message: "A budget already exists for this category.",
      });
    }

    // If not exists, proceed to insert
    const insertQuery = `INSERT INTO budgets (userID, categoryID) VALUES (?, ?)`;
    db.query(insertQuery, [userID, categoryID], (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err });
      res.status(201).json({ success: true, insertId: result.insertId });
    });
  });
};
