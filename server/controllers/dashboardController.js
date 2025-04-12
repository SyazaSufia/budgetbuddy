const db = require("../db");

// Get Dashboard Summary
const getDashboardSummary = (req, res) => {
  const userID = req.session.user.id;
  const timeFilter = req.query.period || "month"; // Default to current month

  let startDate, endDate;
  const currentDate = new Date();

  // Calculate date ranges based on the selected time period
  switch (timeFilter) {
    case "month":
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      break;
    case "lastMonth":
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
      break;
    case "year":
      startDate = new Date(currentDate.getFullYear(), 0, 1);
      endDate = new Date(currentDate.getFullYear(), 11, 31);
      break;
    case "last12Months":
      startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      break;
    default:
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  }

  // Format dates for MySQL query
  const formattedStartDate = startDate.toISOString().split("T")[0];
  const formattedEndDate = endDate.toISOString().split("T")[0];

  // Query for total income in date range
  const incomeQuery = `
      SELECT COALESCE(SUM(amount), 0) as totalIncome 
      FROM income 
      WHERE userID = ? 
      AND date BETWEEN ? AND ?
    `;

  // For debugging, let's also directly check if there are any income records
  const checkIncomeQuery = `
    SELECT * FROM income WHERE userID = ? AND date BETWEEN ? AND ?
  `;
  
  db.query(checkIncomeQuery, [userID, formattedStartDate, formattedEndDate], (err, incomeRecords) => {
    if (err) {
      console.error("Error checking income records:", err);
    } else {
      console.log("Found income records:", incomeRecords.length);
      console.log("Income records sample:", incomeRecords.slice(0, 3));
    }
  });

  db.query(
    incomeQuery,
    [userID, formattedStartDate, formattedEndDate],
    (err, incomeResult) => {
      if (err) {
        console.error("Error fetching income data:", err);
        return res
          .status(500)
          .json({ error: "Failed to fetch dashboard data." });
      }
      
      console.log("Income query result:", incomeResult);

      // Query for total expenses in date range
      const expenseQuery = `
        SELECT COALESCE(SUM(amount), 0) as totalExpense 
        FROM expenses 
        WHERE userID = ? 
        AND date BETWEEN ? AND ?
      `;

      db.query(
        expenseQuery,
        [userID, formattedStartDate, formattedEndDate],
        (err, expenseResult) => {
          if (err) {
            console.error("Error fetching expense data:", err);
            return res
              .status(500)
              .json({ error: "Failed to fetch dashboard data." });
          }

          // Get expense breakdown by category
          const categoryQuery = `
          SELECT 
            c.categoryID, 
            c.categoryName as category, 
            COALESCE(SUM(e.amount), 0) as amount 
          FROM 
            expenses e
          JOIN 
            categories c ON e.categoryID = c.categoryID
          WHERE 
            e.userID = ? 
            AND e.date BETWEEN ? AND ?
          GROUP BY 
            e.categoryID
        `;

          db.query(
            categoryQuery,
            [userID, formattedStartDate, formattedEndDate],
            (err, expensesByCategory) => {
              if (err) {
                console.error("Error fetching category data:", err);
                return res
                  .status(500)
                  .json({ error: "Failed to fetch dashboard data." });
              }

              // Calculate total amounts and balance
              const totalIncome = parseFloat(incomeResult[0].totalIncome) || 0;
              const totalExpense = parseFloat(expenseResult[0].totalExpense) || 0;
              const balance = totalIncome - totalExpense;
              
              console.log("Calculated values:", {
                totalIncome, 
                totalExpense,
                balance
              });

              // Calculate percentages for expense categories
              let totalExpenseAmount = 0;
              expensesByCategory.forEach((category) => {
                totalExpenseAmount += parseFloat(category.amount);
              });

              const expenseCategoriesWithPercentage = expensesByCategory.map(
                (category) => {
                  const percentage =
                    totalExpenseAmount > 0
                      ? ((category.amount / totalExpenseAmount) * 100).toFixed(2)
                      : "0.00";

                  return {
                    ...category,
                    percentage,
                  };
                }
              );

              const responseData = {
                success: true,
                data: {
                  balance: balance.toFixed(2),
                  income: totalIncome.toFixed(2),
                  expense: totalExpense.toFixed(2),
                  expensesByCategory: expenseCategoriesWithPercentage,
                  period: timeFilter,
                },
              };

              // Send response
              res.json(responseData);
            }
          );
        }
      );
    }
  );
};

module.exports = {
  getDashboardSummary,
};