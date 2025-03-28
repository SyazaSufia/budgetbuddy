const db = require('../db');

// Add Income
const addIncome = (req, res) => {
  const { type, title, source, date, amount } = req.body;
  const userID = req.session.user.id;

  if (!type || !title || !date || !amount) {
    return res.status(400).json({ error: "All required fields must be provided!" });
  }

  const query = `
    INSERT INTO income (userID, type, title, source, date, amount)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(query, [userID, type, title, source || null, date, amount], (err) => {
    if (err) {
      console.error("Error adding income:", err);
      return res.status(500).json({ error: "Failed to add income." });
    }
    res.status(201).json({ message: "Income added successfully!" });
  });
};

// Fetch Income
const fetchIncomes = (req, res) => {
  const userID = req.session.user?.id;

  if (!userID) {
    return res.status(401).json({ error: "User not authenticated." });
  }

  const query = `
    SELECT * FROM income
    WHERE userID = ?
    ORDER BY date DESC
  `;
  db.query(query, [userID], (err, rows) => {
    if (err) {
      console.error("Error fetching income records:", err);
      return res.status(500).json({ error: "Failed to fetch income records." });
    }
    res.status(200).json(rows);
  });
};

// Delete Income
const deleteIncome = (req, res) => {
  const { incomeID } = req.params;
  const userID = req.session.user.id;

  const query = `
    DELETE FROM income
    WHERE incomeID = ? AND userID = ?
  `;
  db.query(query, [incomeID, userID], (err, result) => {
    if (err) {
      console.error("Error deleting income record:", err);
      return res.status(500).json({ error: "Failed to delete income." });
    }

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Income deleted successfully!" });
    } else {
      res.status(404).json({ error: "Income record not found." });
    }
  });
};

// Update Income
const updateIncome = (req, res) => {
  const { incomeID } = req.params;
  const { type, title, source, date, amount } = req.body;

  if (!type || !title || !date || !amount) {
    return res.status(400).json({ error: "All required fields must be provided!" });
  }

  const query = `
    UPDATE income
    SET type = ?, title = ?, source = ?, date = ?, amount = ?
    WHERE incomeID = ?
  `;
  db.query(query, [type, title, source || null, date, amount, incomeID], (err, result) => {
    if (err) {
      console.error("Error updating income record:", err);
      return res.status(500).json({ error: "Failed to update income." });
    }

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Income updated successfully!" });
    } else {
      res.status(404).json({ error: "Income record not found." });
    }
  });
};

module.exports = {
  addIncome,
  fetchIncomes,
  deleteIncome,
  updateIncome,
};