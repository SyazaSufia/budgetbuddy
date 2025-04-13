const db = require('../db');

// Add Income with recurring functionality
const addIncome = (req, res) => {
  const { type, title, source, date, amount, occurrence } = req.body;
  const userID = req.session.user.id;

  if (!type || !title || !date || !amount) {
    return res.status(400).json({ error: "All required fields must be provided!" });
  }

  // Create the initial income entry
  const insertQuery = `
    INSERT INTO income (userID, type, title, source, date, amount, occurrence, isRecurring)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const isRecurring = occurrence !== 'once';
  
  db.query(
    insertQuery, 
    [userID, type, title, source || null, date, amount, occurrence, isRecurring], 
    (err, result) => {
      if (err) {
        console.error("Error adding income:", err);
        return res.status(500).json({ error: "Failed to add income." });
      }
      
      const incomeID = result.insertId;
      
      // If not recurring, we're done
      if (!isRecurring) {
        return res.status(201).json({ 
          message: "Income added successfully!",
          incomeID
        });
      }
      
      // For recurring income, schedule future occurrences in the system
      scheduleRecurringIncome(userID, incomeID, {
        type, 
        title, 
        source, 
        date, 
        amount, 
        occurrence
      });
      
      res.status(201).json({ 
        message: "Recurring income set up successfully!",
        incomeID
      });
    }
  );
};

// Schedule recurring income entries
const scheduleRecurringIncome = (userID, parentIncomeID, incomeData) => {
  // This function would set up a scheduler or create future dated entries
  // For demonstration, we'll just log it, but in production you'd use a scheduling library
  console.log(`Scheduled recurring income for user ${userID}:`, {
    parentIncomeID,
    ...incomeData
  });
  
  // In a real implementation, you'd use a job scheduler like node-cron or agenda
  // to create new income entries at the appropriate times
  
  // Example pseudo-code for setting up a scheduler:
  /*
  const schedule = require('node-cron');
  
  let cronExpression;
  switch (incomeData.occurrence) {
    case 'daily':
      cronExpression = '0 0 * * *'; // Run at midnight every day
      break;
    case 'weekly':
      cronExpression = '0 0 * * 1'; // Run at midnight every Monday
      break;
    case 'monthly':
      cronExpression = '0 0 1 * *'; // Run at midnight on the 1st of every month
      break;
    case 'yearly':
      // Extract month and day from original date
      const originalDate = new Date(incomeData.date);
      const month = originalDate.getMonth() + 1;
      const day = originalDate.getDate();
      cronExpression = `0 0 ${day} ${month} *`; // Run annually on the same date
      break;
  }
  
  schedule.schedule(cronExpression, () => {
    // Generate the next income date based on the current date
    const currentDate = new Date();
    let nextDate;
    
    // Calculate next date based on occurrence
    // ...
    
    // Insert new income entry
    db.query(
      `INSERT INTO income (userID, type, title, source, date, amount, occurrence, isRecurring, parentIncomeID)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userID,
        incomeData.type,
        incomeData.title,
        incomeData.source || null,
        nextDate.toISOString().split('T')[0],
        incomeData.amount,
        incomeData.occurrence,
        true,
        parentIncomeID
      ]
    );
  });
  */
};

// Fetch Income - Include recurring income information
const fetchIncomes = (req, res) => {
  const userID = req.session.user?.id;

  if (!userID) {
    return res.status(401).json({ error: "User not authenticated." });
  }

  const query = `
    SELECT *, 
           (SELECT COUNT(*) FROM income i2 WHERE i2.parentIncomeID = income.incomeID) as recurrenceCount
    FROM income
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

// Delete Income - Consider children for recurring incomes
const deleteIncome = (req, res) => {
  const { incomeID } = req.params;
  const userID = req.session.user.id;
  const { deleteAllRecurrences } = req.query; // Optional query param to delete all instances

  if (deleteAllRecurrences === 'true') {
    // First, delete all child recurrences
    const deleteChildrenQuery = `
      DELETE FROM income
      WHERE parentIncomeID = ? AND userID = ?
    `;
    db.query(deleteChildrenQuery, [incomeID, userID], (err) => {
      if (err) {
        console.error("Error deleting recurring income instances:", err);
        return res.status(500).json({ error: "Failed to delete recurring income instances." });
      }
      
      // Then delete the parent
      deleteParentIncome(incomeID, userID, res);
    });
  } else {
    // Just delete the single income entry
    deleteParentIncome(incomeID, userID, res);
  }
};

// Helper function to delete a single income entry
const deleteParentIncome = (incomeID, userID, res) => {
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

// Update Income - Consider updating recurring pattern
const updateIncome = (req, res) => {
  const { incomeID } = req.params;
  const { type, title, source, date, amount, occurrence, updateAllRecurrences } = req.body;
  const userID = req.session.user.id;

  if (!type || !title || !date || !amount) {
    return res.status(400).json({ error: "All required fields must be provided!" });
  }

  // If updating all recurrences of a recurring income
  if (updateAllRecurrences) {
    // Update parent income
    updateSingleIncome(incomeID, userID, { type, title, source, date, amount, occurrence }, (err, parentResult) => {
      if (err) {
        return res.status(500).json({ error: "Failed to update parent income." });
      }
      
      // Update all child incomes with new parameters
      const updateChildrenQuery = `
        UPDATE income
        SET type = ?, title = ?, source = ?, amount = ?, occurrence = ?
        WHERE parentIncomeID = ? AND userID = ? AND date > ?
      `;
      
      db.query(
        updateChildrenQuery, 
        [type, title, source || null, amount, occurrence, incomeID, userID, date],
        (childErr, childResult) => {
          if (childErr) {
            console.error("Error updating child incomes:", childErr);
            return res.status(500).json({ error: "Failed to update all recurring instances." });
          }
          
          res.status(200).json({ 
            message: "All recurring income instances updated successfully!",
            updatedCount: childResult.affectedRows + (parentResult.affectedRows > 0 ? 1 : 0)
          });
        }
      );
    });
  } else {
    // Just update the single income
    updateSingleIncome(incomeID, userID, { type, title, source, date, amount, occurrence }, (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Failed to update income." });
      }
      
      if (result.affectedRows > 0) {
        res.status(200).json({ message: "Income updated successfully!" });
      } else {
        res.status(404).json({ error: "Income record not found." });
      }
    });
  }
};

// Helper function to update a single income entry
const updateSingleIncome = (incomeID, userID, data, callback) => {
  const { type, title, source, date, amount, occurrence } = data;
  
  const query = `
    UPDATE income
    SET type = ?, title = ?, source = ?, date = ?, amount = ?, occurrence = ?
    WHERE incomeID = ? AND userID = ?
  `;
  
  db.query(
    query, 
    [type, title, source || null, date, amount, occurrence || 'once', incomeID, userID], 
    (err, result) => {
      if (err) {
        console.error("Error updating income record:", err);
        return callback(err);
      }
      callback(null, result);
    }
  );
};

module.exports = {
  addIncome,
  fetchIncomes,
  deleteIncome,
  updateIncome
};