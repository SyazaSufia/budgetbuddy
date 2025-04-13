const db = require('../db');
const cron = require('node-cron');

// Function to create next occurrence income entry based on recurring pattern
const createNextRecurringIncome = async () => {
  console.log('Running recurring income scheduler...');
  
  // Find all recurring incomes that need next entries created
  const findRecurringQuery = `
    SELECT i.*, u.userID as userID 
    FROM income i
    JOIN user u ON i.userID = u.userID
    WHERE i.isRecurring = true 
    AND i.occurrence != 'once'
    AND (
      (i.occurrence = 'daily' AND DATE_ADD(i.date, INTERVAL 1 DAY) <= CURDATE()) OR
      (i.occurrence = 'weekly' AND DATE_ADD(i.date, INTERVAL 1 WEEK) <= CURDATE()) OR
      (i.occurrence = 'monthly' AND DATE_ADD(i.date, INTERVAL 1 MONTH) <= CURDATE()) OR
      (i.occurrence = 'yearly' AND DATE_ADD(i.date, INTERVAL 1 YEAR) <= CURDATE())
    )
  `;
  
  db.query(findRecurringQuery, [], async (err, incomes) => {
    if (err) {
      console.error('Error finding recurring incomes:', err);
      return;
    }
    
    console.log(`Found ${incomes.length} recurring incomes to process`);
    
    // Process each recurring income
    for (const income of incomes) {
      try {
        // Calculate next date based on occurrence pattern
        const nextDate = calculateNextDate(income.date, income.occurrence);
        
        // Check if we already have an entry for this date
        const checkExistingQuery = `
          SELECT COUNT(*) as count FROM income 
          WHERE parentIncomeID = ? AND date = ?
        `;
        
        db.query(checkExistingQuery, [income.incomeID, nextDate], (err, result) => {
          if (err) {
            console.error('Error checking existing entries:', err);
            return;
          }
          
          // Skip if we already have an entry for this date
          if (result[0].count > 0) {
            console.log(`Entry already exists for income ID ${income.incomeID} on ${nextDate}`);
            return;
          }
          
          // Create new income entry
          const insertQuery = `
            INSERT INTO income (
              userID, type, title, source, date, amount, 
              occurrence, isRecurring, parentIncomeID
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          
          db.query(insertQuery, [
            income.userID,
            income.type,
            income.title,
            income.source,
            nextDate,
            income.amount,
            income.occurrence,
            true,
            income.incomeID
          ], (err, result) => {
            if (err) {
              console.error('Error creating recurring income entry:', err);
              return;
            }
            
            console.log(`Created recurring income entry: ID ${result.insertId} for user ${income.userID}`);
          });
        });
      } catch (error) {
        console.error(`Error processing recurring income ID ${income.incomeID}:`, error);
      }
    }
  });
};

// Helper function to calculate next date based on occurrence pattern
const calculateNextDate = (baseDate, occurrence) => {
  const date = new Date(baseDate);
  
  switch (occurrence) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      throw new Error(`Unknown occurrence type: ${occurrence}`);
  }
  
  return date.toISOString().split('T')[0];
};

// Schedule the job to run daily at midnight
const scheduleJob = () => {
  cron.schedule('0 0 * * *', () => {
    createNextRecurringIncome();
  });
  
  console.log('Recurring income scheduler initialized');
};

// Run immediately on startup to handle any missed occurrences
const initialize = () => {
  scheduleJob();
  createNextRecurringIncome();
};

module.exports = {
  initialize
};