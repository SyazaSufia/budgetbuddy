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

    // Validate amount - must be a positive number
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res
        .status(400)
        .json({ error: "Amount must be a positive number greater than 0!" });
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
      numericAmount, // Use the validated numeric amount
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

    // First, get information about this income entry
    const getIncomeQuery = `
      SELECT incomeID, parentIncomeID, isRecurring 
      FROM income 
      WHERE incomeID = ? AND userID = ?
    `;
    
    const [incomeInfo] = await db.query(getIncomeQuery, [incomeID, userID]);

    if (!incomeInfo) {
      return res.status(404).json({ error: "Income record not found." });
    }

    // Check if this income is part of a recurring series (either a parent or has a parent)
    const isPartOfRecurringSeries = incomeInfo.isRecurring || incomeInfo.parentIncomeID !== null;

    // Check if it has child entries
    const checkChildrenQuery = `
      SELECT COUNT(*) as childCount
      FROM income
      WHERE parentIncomeID = ? AND userID = ?
    `;
    
    const [childResult] = await db.query(checkChildrenQuery, [incomeID, userID]);
    const hasChildren = childResult.childCount > 0;

    // Handle deletion based on the type and options
    if (deleteAllRecurrences === "true") {
      // Case 1: Delete all recurrences

      // If this is a child income in a series, we need to get the root parent first
      let rootParentID = incomeID;
      if (incomeInfo.parentIncomeID !== null) {
        // Find the root parent
        const getRootParentQuery = `
          WITH RECURSIVE RecursiveParents AS (
            SELECT incomeID, parentIncomeID
            FROM income
            WHERE incomeID = ?
            
            UNION ALL
            
            SELECT i.incomeID, i.parentIncomeID
            FROM income i
            JOIN RecursiveParents rp ON i.incomeID = rp.parentIncomeID
          )
          SELECT incomeID 
          FROM RecursiveParents
          WHERE parentIncomeID IS NULL
          LIMIT 1
        `;
        
        try {
          // Try with CTE (Common Table Expression) for databases that support it
          const [rootParent] = await db.query(getRootParentQuery, [incomeInfo.parentIncomeID]);
          if (rootParent) {
            rootParentID = rootParent.incomeID;
          }
        } catch (cteError) {
          // If CTE is not supported, fall back to a simpler approach
          console.log("CTE not supported, using fallback approach");
          
          // Simpler approach to find root parent
          let currentParentID = incomeInfo.parentIncomeID;
          let iterations = 0;
          const MAX_ITERATIONS = 20; // Safety check to prevent infinite loops
          
          while (currentParentID !== null && iterations < MAX_ITERATIONS) {
            const [parent] = await db.query(
              'SELECT incomeID, parentIncomeID FROM income WHERE incomeID = ?', 
              [currentParentID]
            );
            
            if (!parent || parent.parentIncomeID === null) {
              rootParentID = currentParentID;
              break;
            }
            
            currentParentID = parent.parentIncomeID;
            iterations++;
          }
        }
      }
      
      // Delete all children first (for all levels)
      const deleteAllChildrenQuery = `
        DELETE FROM income
        WHERE (
          parentIncomeID = ? 
          OR parentIncomeID IN (
            SELECT incomeID FROM (
              SELECT incomeID FROM income WHERE parentIncomeID = ?
            ) AS subquery
          )
        ) 
        AND userID = ?
      `;
      
      await db.query(deleteAllChildrenQuery, [rootParentID, rootParentID, userID]);
      
      // Then delete the root parent
      const deleteRootQuery = `
        DELETE FROM income
        WHERE incomeID = ? AND userID = ?
      `;
      
      await db.query(deleteRootQuery, [rootParentID, userID]);
      
      res.status(200).json({
        message: "All recurring income instances deleted successfully!",
      });
    } else {
      // Case 2: Delete single income
      
      // If it has children or is referenced, don't allow single deletion
      if (hasChildren) {
        return res.status(400).json({ 
          error: "This income has recurring instances. Please select 'Delete all recurrences' option.", 
          hasChildren: true 
        });
      }
      
      // If it's part of a recurring series, need to handle differently
      if (isPartOfRecurringSeries && incomeInfo.parentIncomeID !== null) {
        // This is a child in a series, we can delete it if it doesn't have its own children
        const deleteQuery = `
          DELETE FROM income
          WHERE incomeID = ? AND userID = ? AND NOT EXISTS (
            SELECT 1 FROM income WHERE parentIncomeID = ?
          )
        `;
        
        const result = await db.query(deleteQuery, [incomeID, userID, incomeID]);
        
        if (result.affectedRows > 0) {
          res.status(200).json({ message: "Income deleted successfully!" });
        } else {
          res.status(400).json({ 
            error: "Cannot delete this income. It might be referenced by other recurring incomes.",
            hasChildren: true
          });
        }
      } else {
        // Not part of a series or is the parent in a series with no children
        const deleteQuery = `
          DELETE FROM income
          WHERE incomeID = ? AND userID = ? AND NOT EXISTS (
            SELECT 1 FROM income WHERE parentIncomeID = ?
          )
        `;
        
        const result = await db.query(deleteQuery, [incomeID, userID, incomeID]);
        
        if (result.affectedRows > 0) {
          res.status(200).json({ message: "Income deleted successfully!" });
        } else {
          res.status(400).json({ 
            error: "Cannot delete this income. It might be referenced by other recurring incomes.",
            hasChildren: true
          });
        }
      }
    }
  } catch (err) {
    console.error("Error deleting income:", err);
    res.status(500).json({ error: "Failed to delete income: " + err.message });
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

    // Validate amount - must be a positive number
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res
        .status(400)
        .json({ error: "Amount must be a positive number greater than 0!" });
    }

    // If updating all recurrences of a recurring income
    if (updateAllRecurrences) {
      // Update parent income
      const parentResult = await updateSingleIncome(incomeID, userID, {
        type,
        title,
        source,
        date,
        amount: numericAmount, // Use validated numeric amount
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
        numericAmount, // Use validated numeric amount
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
        amount: numericAmount, // Use validated numeric amount
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
    amount, // Amount is already validated as numeric in calling functions
    occurrence || "once",
    isRecurring,
    incomeID,
    userID,
  ]);

  return result;
};

// NEW: Get monthly income total
const getMonthlyIncome = async (req, res) => {
  try {
    if (!req.session || !req.session.user || !req.session.user.id) {
      return res.status(401).json({ error: "User not authenticated." });
    }

    const userID = req.session.user.id;
    const { month, year } = req.query;

    // If no month/year provided, use current month/year
    const now = new Date();
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year) : now.getFullYear();

    const query = `
      SELECT SUM(amount) as totalIncome
      FROM income
      WHERE userID = ? 
        AND MONTH(date) = ? 
        AND YEAR(date) = ?
    `;

    const results = await db.query(query, [userID, targetMonth, targetYear]);
    const totalIncome = results[0]?.totalIncome || 0;

    res.status(200).json({
      success: true,
      data: {
        totalIncome: parseFloat(totalIncome),
        month: targetMonth,
        year: targetYear
      }
    });
  } catch (err) {
    console.error("Error getting monthly income:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to get monthly income." 
    });
  }
};

// NEW: Check if user has income for a specific month
const checkMonthlyIncomeExists = async (req, res) => {
  try {
    if (!req.session || !req.session.user || !req.session.user.id) {
      return res.status(401).json({ error: "User not authenticated." });
    }

    const userID = req.session.user.id;
    const { month, year } = req.query;

    // If no month/year provided, use current month/year
    const now = new Date();
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year) : now.getFullYear();

    const query = `
      SELECT COUNT(*) as incomeCount, SUM(amount) as totalIncome
      FROM income
      WHERE userID = ? 
        AND MONTH(date) = ? 
        AND YEAR(date) = ?
    `;

    const results = await db.query(query, [userID, targetMonth, targetYear]);
    const incomeCount = results[0]?.incomeCount || 0;
    const totalIncome = results[0]?.totalIncome || 0;

    res.status(200).json({
      success: true,
      data: {
        hasIncome: incomeCount > 0,
        incomeCount: parseInt(incomeCount),
        totalIncome: parseFloat(totalIncome),
        month: targetMonth,
        year: targetYear
      }
    });
  } catch (err) {
    console.error("Error checking monthly income:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to check monthly income." 
    });
  }
};

module.exports = {
  addIncome,
  fetchIncomes,
  deleteIncome,
  updateIncome,
  getMonthlyIncome,
  checkMonthlyIncomeExists,
};