const db = require('../db');
const cron = require('node-cron');

// Function to create next occurrence income entry based on recurring pattern
const createNextRecurringIncome = async () => {
  console.log('Running recurring income scheduler job - checking for recurring incomes...');
  
  try {
    // Find all recurring incomes that need next entries created
    const findRecurringQuery = `
      SELECT * 
      FROM income 
      WHERE isRecurring = true 
      AND occurrence != 'once'
      AND (
        (occurrence = 'daily' AND DATE_ADD(date, INTERVAL 1 DAY) <= CURDATE()) OR
        (occurrence = 'weekly' AND DATE_ADD(date, INTERVAL 1 WEEK) <= CURDATE()) OR
        (occurrence = 'monthly' AND DATE_ADD(date, INTERVAL 1 MONTH) <= CURDATE()) OR
        (occurrence = 'yearly' AND DATE_ADD(date, INTERVAL 1 YEAR) <= CURDATE())
      )
    `;
    
    const incomes = await db.query(findRecurringQuery);
    
    console.log(`Found ${incomes.length} recurring incomes to process`);
    
    // Process each recurring income
    for (const income of incomes) {
      try {
        // Calculate next date based on occurrence pattern
        const nextDate = calculateNextDate(income.date, income.occurrence);
        
        // Check if we already have an entry for this date and parent ID
        const checkExistingQuery = `
          SELECT COUNT(*) as count 
          FROM income 
          WHERE parentIncomeID = ? AND date = ?
        `;
        
        const existingResults = await db.query(checkExistingQuery, [income.incomeID, nextDate]);
        
        // Skip if we already have an entry for this date
        if (existingResults[0].count > 0) {
          console.log(`Entry already exists for income ID ${income.incomeID} on ${nextDate}`);
          continue;
        }
        
        // Create new income entry
        const insertQuery = `
          INSERT INTO income (
            userID, type, title, source, date, amount, 
            occurrence, isRecurring, parentIncomeID
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const result = await db.query(insertQuery, [
          income.userID,
          income.type,
          income.title,
          income.source,
          nextDate,
          income.amount,
          income.occurrence,
          true,
          income.incomeID
        ]);
        
        console.log(`Created recurring income entry: ID ${result.insertId} for user ${income.userID}`);
        
      } catch (error) {
        console.error(`Error processing recurring income ID ${income.incomeID}:`, error);
      }
    }
  } catch (err) {
    console.error('Error in recurring income scheduler:', err);
  }
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
  // Schedule daily at midnight
  cron.schedule('0 0 * * *', () => {
    console.log('Running scheduled recurring income job');
    createNextRecurringIncome();
  });
  
  // Also run at server start to catch up any missed occurrences
  console.log('Recurring income scheduler initialized');
};

// Run immediately on startup to handle any missed occurrences
const initialize = () => {
  scheduleJob();
  
  // Run immediately to process any pending recurrences
  createNextRecurringIncome()
    .then(() => console.log('Initial income recurrence processing complete'))
    .catch(err => console.error('Error in initial income recurrence processing:', err));
};

module.exports = {
  initialize
};