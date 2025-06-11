const PDFDocument = require('pdfkit');
const Chart = require('chart.js');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

// Helper function to format period label
const formatPeriodLabel = (period) => {
  const now = new Date();
  switch (period) {
    case 'month':
      return now.toLocaleString('default', { month: 'long', year: 'numeric' });
    case 'lastMonth':
      return new Date(now.getFullYear(), now.getMonth() - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
    case 'year':
      return now.getFullYear().toString();
    case 'last12Months':
      return `${new Date(now.getFullYear() - 1, now.getMonth()).toLocaleString('default', { month: 'long', year: 'numeric' })} - ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
    default:
      return period;
  }
};

// Generate pie chart for expenses
async function generatePieChart(categories) {
  const width = 350;
  const height = 350;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

  const configuration = {
    type: 'pie',
    data: {
      labels: categories.map(cat => cat.category),
      datasets: [{
        data: categories.map(cat => cat.amount),
        backgroundColor: [
          '#151AA5', // primaryColor
          '#A5D6A7', // secondaryColor
          '#D4E8FF', // tertiaryColor
          '#7986CB',
          '#64B5F6',
          '#4FC3F7',
          '#4DD0E1',
          '#4DB6AC',
          '#81C784',
          '#FFB74D'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#333333',
            font: {
              size: 11,
              family: 'Arial'
            },
            padding: 15,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

const generateDashboardPDF = async (data) => {
  return new Promise(async (resolve) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      bufferPages: false // Disable page buffering to prevent blank pages
    });

    // Store PDF chunks
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    // Colors
    const primaryColor = '#151AA5';
    const secondaryColor = '#666666';
    const accentColor = '#4CAF50';
    const warningColor = '#FF9800';
    const dangerColor = '#F44336';

    // Header Section
    doc.fontSize(20)
       .fillColor(primaryColor)
       .font('Helvetica-Bold')
       .text('BudgetBuddy Dashboard', 40, 40);

    doc.fontSize(11)
       .fillColor(secondaryColor)
       .font('Helvetica')
       .text(`Period: ${formatPeriodLabel(data.period)}`, 40, 70)
       .text(`Generated on: ${new Date().toLocaleDateString()}`, 40, 85);

    // Header line
    doc.moveTo(40, 105)
       .lineTo(555, 105)
       .strokeColor(primaryColor)
       .lineWidth(2)
       .stroke();

    // Financial Overview Section
    let currentY = 125;
    doc.fontSize(14)
       .fillColor(primaryColor)
       .font('Helvetica-Bold')
       .text('Financial Overview', 40, currentY);

    currentY += 25;

    // Summary cards in a row
    const cardWidth = 160;
    const cardHeight = 60;
    const cardSpacing = 17;
    
    const summaryData = [
      { 
        label: 'Balance', 
        amount: `RM ${parseFloat(data.balance).toFixed(2)}`, 
        color: parseFloat(data.balance) >= 0 ? accentColor : dangerColor 
      },
      { 
        label: 'Total Income', 
        amount: `RM ${parseFloat(data.income).toFixed(2)}`, 
        color: accentColor 
      },
      { 
        label: 'Total Expenses', 
        amount: `RM ${parseFloat(data.expense).toFixed(2)}`, 
        color: dangerColor 
      }
    ];

    summaryData.forEach((item, index) => {
      const xPos = 40 + (index * (cardWidth + cardSpacing));
      
      // Card background with rounded corners (simulate with multiple small rects)
      const cornerRadius = 4;
      doc.roundedRect(xPos, currentY, cardWidth, cardHeight, cornerRadius)
         .fillColor('#f8f9fa')
         .fill();
      
      // Card border with rounded corners
      doc.roundedRect(xPos, currentY, cardWidth, cardHeight, cornerRadius)
         .strokeColor('#e9ecef')
         .lineWidth(1)
         .stroke();
      
      // Label
      doc.fontSize(9)
         .fillColor(secondaryColor)
         .font('Helvetica')
         .text(item.label, xPos + 10, currentY + 10);
      
      // Amount
      doc.fontSize(14)
         .fillColor(item.color)
         .font('Helvetica-Bold')
         .text(item.amount, xPos + 10, currentY + 25);
    });

    currentY += cardHeight + 30;

    // Expenses by Category Section
    if (data.expensesByCategory && data.expensesByCategory.length > 0) {
      doc.fontSize(14)
         .fillColor(primaryColor)
         .font('Helvetica-Bold')
         .text('Expenses by Category', 40, currentY);

      currentY += 25;

      // Check if we need a new page for the chart
      if (currentY + 200 > doc.page.height - 40) {
        doc.addPage();
        currentY = 40;
        doc.fontSize(14)
           .fillColor(primaryColor)
           .font('Helvetica-Bold')
           .text('Expenses by Category (continued)', 40, currentY);
        currentY += 25;
      }

      // Generate and add pie chart
      const chartBuffer = await generatePieChart(data.expensesByCategory);
      const chartSize = 200;
      doc.image(chartBuffer, 40, currentY, { width: chartSize });

      // Category details table next to chart
      const tableX = 260;
      let tableY = currentY;

      // Table headers
      doc.fontSize(10)
         .fillColor(primaryColor)
         .font('Helvetica-Bold')
         .text('Category', tableX, tableY)
         .text('Amount (RM)', tableX + 120, tableY)
         .text('Share (%)', tableX + 200, tableY);

      // Header line
      doc.moveTo(tableX, tableY + 15)
         .lineTo(tableX + 250, tableY + 15)
         .strokeColor('#dee2e6')
         .lineWidth(1)
         .stroke();

      tableY += 25;

      // Table rows
      data.expensesByCategory.forEach((category, index) => {
        if (tableY > doc.page.height - 60) {
          doc.addPage();
          tableY = 40;
          // Repeat headers on new page
          doc.fontSize(10)
             .fillColor(primaryColor)
             .font('Helvetica-Bold')
             .text('Category', tableX, tableY)
             .text('Amount (RM)', tableX + 120, tableY)
             .text('Share (%)', tableX + 200, tableY);
          doc.moveTo(tableX, tableY + 15)
             .lineTo(tableX + 250, tableY + 15)
             .strokeColor('#dee2e6')
             .lineWidth(1)
             .stroke();
          tableY += 25;
        }

        // Alternate row colors
        if (index % 2 === 1) {
          doc.roundedRect(tableX - 5, tableY - 5, 260, 18, 2)
             .fillColor('#f8f9fa')
             .fill();
        }

        doc.fontSize(9)
           .fillColor('#333333')
           .font('Helvetica')
           .text(category.category, tableX, tableY)
           .text(parseFloat(category.amount).toFixed(2), tableX + 120, tableY)
           .text(`${category.percentage}%`, tableX + 200, tableY);

        tableY += 18;
      });

      currentY = Math.max(currentY + chartSize, tableY) + 30;
    }

    // Budget Overview Section
    if (data.budgetOverview && data.budgetOverview.length > 0) {
      // Filter out budget items with 0% progress for the current period
      const activeBudgets = data.budgetOverview.filter(budget => {
        const spent = parseFloat(budget.spent) || 0;
        return spent > 0; // Only show budgets with actual spending
      });

      if (activeBudgets.length > 0) {
        // Check if we need a new page
        if (currentY + 100 > doc.page.height - 80) {
          doc.addPage();
          currentY = 40;
        }

        doc.fontSize(14)
           .fillColor(primaryColor)
           .font('Helvetica-Bold')
           .text('Budget Overview', 40, currentY);

        currentY += 25;

        activeBudgets.forEach((budget, index) => {
          // Check if we need a new page for each budget item
          if (currentY + 70 > doc.page.height - 80) {
            doc.addPage();
            currentY = 40;
          }

          const spent = parseFloat(budget.spent) || 0;
          const budgetLimit = parseFloat(budget.budgetLimit) || 0;
          const progress = budgetLimit > 0 ? (spent / budgetLimit) * 100 : 0;

          // Budget category name
          doc.fontSize(11)
             .fillColor('#333333')
             .font('Helvetica-Bold')
             .text(budget.categoryName, 40, currentY);

          // Budget amounts
          doc.fontSize(9)
             .fillColor(secondaryColor)
             .font('Helvetica')
             .text(`RM ${spent.toFixed(2)} of RM ${budgetLimit.toFixed(2)}`, 40, currentY + 15);

          // Progress bar background with rounded corners
          const barWidth = 300;
          const barHeight = 12;
          const barY = currentY + 30;
          const barRadius = 6;

          doc.roundedRect(40, barY, barWidth, barHeight, barRadius)
             .fillColor('#e9ecef')
             .fill();

          // Progress bar fill with rounded corners
          if (budgetLimit > 0 && spent > 0) {
            const progressWidth = Math.min(barWidth * (progress / 100), barWidth);
            const progressColor = progress > 100 ? dangerColor : progress > 80 ? warningColor : accentColor;
            
            doc.roundedRect(40, barY, progressWidth, barHeight, barRadius)
               .fillColor(progressColor)
               .fill();
          }

          // Progress percentage
          doc.fontSize(9)
             .fillColor('#333333')
             .font('Helvetica')
             .text(`${progress.toFixed(1)}%`, 350, barY + 2);

          currentY += 60;
        });
      }
    }

    // Footer with generation info (only if there's enough space)
    const footerHeight = 50;
    if (currentY + footerHeight + 20 <= doc.page.height - 40) {
      const footerY = doc.page.height - 60;
      doc.moveTo(40, footerY)
         .lineTo(555, footerY)
         .strokeColor('#dee2e6')
         .lineWidth(1)
         .stroke();

      doc.fontSize(8)
         .fillColor(secondaryColor)
         .font('Helvetica')
         .text('Generated by BudgetBuddy', 40, footerY + 10)
         .text(`Report Date: ${new Date().toLocaleDateString()}`, 40, footerY + 23)
         .text('This report contains your personal financial data. Keep it secure.', 40, footerY + 36);
    }

    doc.end();
  });
};

module.exports = {
  generateDashboardPDF
};