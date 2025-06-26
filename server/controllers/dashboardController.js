const db = require("../db");
const { generateDashboardPDF } = require('../services/pdfGenerator');

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
        // Current month: first day to last day
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        break;
      case "lastMonth":
        // Last month: first day to last day of previous month
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        break;
      case "year":
        // Current year: Jan 1 to Dec 31
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        endDate = new Date(currentDate.getFullYear(), 11, 31);
        break;
      case "last12Months":
        // Last 12 months: same day last year to end of current month
        startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        break;
      default:
        // Default to current month
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    }

    // Format dates to YYYY-MM-DD string format without timezone issues
    const formattedStartDate = formatDateToYMD(startDate);
    const formattedEndDate = formatDateToYMD(endDate);

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

// Helper function to format date to YYYY-MM-DD without timezone issues
const formatDateToYMD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Update the downloadDashboardPDF function
const downloadDashboardPDF = async (req, res) => {
  try {
    const userID = req.session.user.id;
    const timeFilter = req.query.period || "month";

    const dashboardData = await getDashboardData(userID, timeFilter);
    const pdfBuffer = await generateDashboardPDF(dashboardData.data);

    // Set proper headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', `attachment; filename=dashboard-${timeFilter}-${new Date().toISOString().split('T')[0]}.pdf`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Send PDF buffer
    res.send(pdfBuffer);

  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ error: "Failed to generate PDF." });
  }
};

// Helper function to get dashboard data
const getDashboardData = async (userID, timeFilter) => {
  const currentDate = new Date();

  let startDate, endDate;

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

  const formattedStartDate = formatDateToYMD(startDate);
  const formattedEndDate = formatDateToYMD(endDate);

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

  // Add budget overview query
  const budgetQuery = `
    SELECT 
      c.categoryName,
      b.targetAmount as budgetLimit,
      COALESCE(SUM(e.amount), 0) as spent
    FROM budgets b
    JOIN categories c ON b.budgetName = c.categoryName
    LEFT JOIN expenses e ON e.categoryID = c.categoryID 
      AND e.date BETWEEN ? AND ?
    WHERE b.userID = ?
    GROUP BY c.categoryID
  `;

  const budgetOverview = await db.query(budgetQuery, [
    formattedStartDate,
    formattedEndDate,
    userID
  ]);

  // Include budget overview in response
  const responseData = {
    success: true,
    data: {
      balance: balance.toFixed(2),
      income: totalIncome.toFixed(2),
      expense: totalExpense.toFixed(2),
      expensesByCategory: expenseCategoriesWithPercentage,
      budgetOverview,
      period: timeFilter,
    },
  };

  return responseData;
};

module.exports = {
  getDashboardSummary,
  downloadDashboardPDF
};