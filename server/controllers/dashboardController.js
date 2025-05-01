const db = require("../db");

// Get Dashboard Summary
const getDashboardSummary = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const timeFilter = req.query.period || "month"; // Default to current month

    let startDate, endDate;
    const currentDate = new Date();

    // Calculate date ranges based on the selected time period
    switch (timeFilter) {
      case "month":
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        );
        break;
      case "lastMonth":
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        );
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          0
        );
        break;
      case "year":
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        endDate = new Date(currentDate.getFullYear(), 11, 31);
        break;
      case "last12Months":
        startDate = new Date(
          currentDate.getFullYear() - 1,
          currentDate.getMonth(),
          1
        );
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        );
        break;
      default:
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        );
    }

    const formattedStartDate = startDate.toISOString().split("T")[0];
    const formattedEndDate = endDate.toISOString().split("T")[0];

    // Queries
    const incomeQuery = `
      SELECT COALESCE(SUM(amount), 0) as totalIncome 
      FROM income 
      WHERE userID = ? 
      AND date BETWEEN ? AND ?
    `;
    const expenseQuery = `
      SELECT COALESCE(SUM(amount), 0) as totalExpense 
      FROM expenses 
      WHERE userID = ? 
      AND date BETWEEN ? AND ?
    `;
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

    // Execute queries
    const incomeResult = await db.query(incomeQuery, [
      userID,
      formattedStartDate,
      formattedEndDate,
    ]);
    const expenseResult = await db.query(expenseQuery, [
      userID,
      formattedStartDate,
      formattedEndDate,
    ]);
    const expensesByCategory = await db.query(categoryQuery, [
      userID,
      formattedStartDate,
      formattedEndDate,
    ]);

    // Calculations
    const totalIncome = parseFloat(incomeResult[0]?.totalIncome || 0);
    const totalExpense = parseFloat(expenseResult[0]?.totalExpense || 0);
    const balance = totalIncome - totalExpense;

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

    // Response
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

    res.json(responseData);
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data." });
  }
};

module.exports = {
  getDashboardSummary,
};
