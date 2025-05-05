const db = require("../db");

// Add Income with recurring functionality
const addIncome = async (req, res) => {
  try {
    const { type, title, source, date, amount, occurrence } = req.body;

    // More defensive check for user session
    if (!req.session || !req.session.user || !req.session.user.id) {
      return res.status(401).json({ error: "User not authenticated." });
    }

    const userID = req.session.user.id;

    if (!type || !title || !date || !amount) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided!" });
    }

    // Create the initial income entry
    const insertQuery = `
      INSERT INTO income (userID, type, title, source, date, amount, occurrence, isRecurring)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const isRecurring = occurrence !== "once";

    const result = await db.query(insertQuery, [
      userID,
      type,
      title,
      source || null,
      date,
      amount,
      occurrence,
      isRecurring,
    ]);

    const incomeID = result.insertId;

    // Return early for non-recurring incomes
    if (!isRecurring) {
      return res.status(201).json({
        message: "Income added successfully!",
        incomeID,
      });
    }

    // For recurring incomes, the scheduler service will take care of future occurrences
    // No need to do anything additional here as the cron job will pick up new recurring incomes

    res.status(201).json({
      message: "Recurring income set up successfully!",
      incomeID,
    });
  } catch (err) {
    console.error("Error adding income:", err);
    res.status(500).json({ error: "Failed to add income." });
  }
};

// Fetch Income - Include recurring income information
const fetchIncomes = async (req, res) => {
  try {
    // More defensive session check
    if (!req.session || !req.session.user || !req.session.user.id) {
      return res.status(401).json({ error: "User not authenticated." });
    }

    const userID = req.session.user.id;

    const query = `
      SELECT *, 
             (SELECT COUNT(*) FROM income i2 WHERE i2.parentIncomeID = income.incomeID) as recurrenceCount
      FROM income
      WHERE userID = ?
      ORDER BY date DESC
    `;

    const rows = await db.query(query, [userID]);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching income records:", err);
    res.status(500).json({ error: "Failed to fetch income records." });
  }
};

// Delete Income - Consider children for recurring incomes
const deleteIncome = async (req, res) => {
  try {
    const { incomeID } = req.params;

    // More defensive session check
    if (!req.session || !req.session.user || !req.session.user.id) {
      return res.status(401).json({ error: "User not authenticated." });
    }

    const userID = req.session.user.id;
    const { deleteAllRecurrences } = req.query; // Optional query param to delete all instances

    if (deleteAllRecurrences === "true") {
      // First, delete all child recurrences
      const deleteChildrenQuery = `
        DELETE FROM income
        WHERE parentIncomeID = ? AND userID = ?
      `;
      await db.query(deleteChildrenQuery, [incomeID, userID]);

      // Then delete the parent
      await deleteParentIncome(incomeID, userID);
      res.status(200).json({
        message: "All recurring income instances deleted successfully!",
      });
    } else {
      // Just delete the single income entry
      const result = await deleteParentIncome(incomeID, userID);

      if (result.affectedRows > 0) {
        res.status(200).json({ message: "Income deleted successfully!" });
      } else {
        res.status(404).json({ error: "Income record not found." });
      }
    }
  } catch (err) {
    console.error("Error deleting income:", err);
    res.status(500).json({ error: "Failed to delete income." });
  }
};

// Helper function to delete a single income entry
const deleteParentIncome = async (incomeID, userID) => {
  const query = `
    DELETE FROM income
    WHERE incomeID = ? AND userID = ?
  `;
  const result = await db.query(query, [incomeID, userID]);
  return result;
};

// Update Income - Consider updating recurring pattern
const updateIncome = async (req, res) => {
  try {
    const { incomeID } = req.params;
    const {
      type,
      title,
      source,
      date,
      amount,
      occurrence,
      updateAllRecurrences,
    } = req.body;

    // More defensive session check
    if (!req.session || !req.session.user || !req.session.user.id) {
      return res.status(401).json({ error: "User not authenticated." });
    }

    const userID = req.session.user.id;

    if (!type || !title || !date || !amount) {
      return res
        .status(400)
        .json({ error: "All required fields must be provided!" });
    }

    // If updating all recurrences of a recurring income
    if (updateAllRecurrences) {
      // Update parent income
      const parentResult = await updateSingleIncome(incomeID, userID, {
        type,
        title,
        source,
        date,
        amount,
        occurrence,
      });

      // Update all child incomes with new parameters
      const updateChildrenQuery = `
        UPDATE income
        SET type = ?, title = ?, source = ?, amount = ?, occurrence = ?
        WHERE parentIncomeID = ? AND userID = ? AND date > ?
      `;

      const childResult = await db.query(updateChildrenQuery, [
        type,
        title,
        source || null,
        amount,
        occurrence,
        incomeID,
        userID,
        date,
      ]);

      res.status(200).json({
        message: "All recurring income instances updated successfully!",
        updatedCount:
          childResult.affectedRows + (parentResult.affectedRows > 0 ? 1 : 0),
      });
    } else {
      // Just update the single income
      const result = await updateSingleIncome(incomeID, userID, {
        type,
        title,
        source,
        date,
        amount,
        occurrence,
      });

      if (result.affectedRows > 0) {
        res.status(200).json({ message: "Income updated successfully!" });
      } else {
        res.status(404).json({ error: "Income record not found." });
      }
    }
  } catch (err) {
    console.error("Error updating income:", err);
    res.status(500).json({ error: "Failed to update income." });
  }
};

// Helper function to update a single income entry
const updateSingleIncome = async (incomeID, userID, data) => {
  const { type, title, source, date, amount, occurrence } = data;

  const query = `
    UPDATE income
    SET type = ?, title = ?, source = ?, date = ?, amount = ?, occurrence = ?, 
        isRecurring = ?
    WHERE incomeID = ? AND userID = ?
  `;

  // Update isRecurring flag based on occurrence
  const isRecurring = occurrence !== "once";

  const result = await db.query(query, [
    type,
    title,
    source || null,
    date,
    amount,
    occurrence || "once",
    isRecurring,
    incomeID,
    userID,
  ]);

  return result;
};

module.exports = {
  addIncome,
  fetchIncomes,
  deleteIncome,
  updateIncome,
};