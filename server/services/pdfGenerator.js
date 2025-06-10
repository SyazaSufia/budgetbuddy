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
  const width = 400;
  const height = 400;
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
        ]
      }]
    },
    options: {
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#000000'
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
      margin: 50,
      bufferPages: true
    });

    // Store PDF chunks
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    // Header with title only
    doc.fontSize(24)
       .fillColor('#151AA5')
       .text('Budget Buddy Dashboard', 50, 50)
       .fontSize(14)
       .fillColor('#666666')
       .text(`Period: ${formatPeriodLabel(data.period)}`, 50, 80);

    // Add decorative header line
    doc.moveTo(50, 110)
       .lineTo(545, 110)
       .strokeColor('#151AA5')
       .stroke();

    // Financial Overview Section
    doc.moveDown(2)
       .fontSize(18)
       .fillColor('#151AA5')
       .text('Financial Overview', { underline: true });

    // Create summary cards
    const summaryData = [
      { label: 'Balance', amount: `RM ${data.balance}`, color: '#151AA5' },
      { label: 'Total Income', amount: `RM ${data.income}`, color: '#4CAF50' },
      { label: 'Total Expenses', amount: `RM ${data.expense}`, color: '#F44336' }
    ];

    // Draw summary cards
    let yPos = doc.y + 20;
    summaryData.forEach((item, index) => {
      const xPos = 50 + (index * 165);
      doc.rect(xPos, yPos, 150, 80)
         .fillColor(item.color)
         .fillOpacity(0.1)
         .fill()
         .fillColor(item.color)
         .fillOpacity(1)
         .fontSize(12)
         .text(item.label, xPos + 10, yPos + 10)
         .fontSize(16)
         .text(item.amount, xPos + 10, yPos + 40);
    });

    // Expenses by Category Section
    doc.moveDown(6)
       .fontSize(18)
       .fillColor('#151AA5')
       .text('Expenses by Category', { underline: true });

    // Add pie chart
    const chartBuffer = await generatePieChart(data.expensesByCategory);
    doc.image(chartBuffer, 50, doc.y + 20, { width: 300 });

    // Category details table
    let tableY = doc.y + 320;
    doc.fontSize(12)
       .fillColor('#000000');

    // Table headers
    const headers = ['Category', 'Amount', 'Percentage'];
    let xPositions = [50, 300, 450];
    
    headers.forEach((header, i) => {
      doc.text(header, xPositions[i], tableY);
    });

    // Table rows
    data.expensesByCategory.forEach((category, index) => {
      tableY += 25;
      doc.text(category.category, xPositions[0], tableY)
         .text(`RM ${parseFloat(category.amount).toFixed(2)}`, xPositions[1], tableY)
         .text(`${category.percentage}%`, xPositions[2], tableY);
    });

    // Budget Overview Section
    doc.addPage()
       .fontSize(18)
       .fillColor('#151AA5')
       .text('Budget Overview', { underline: true });

    // Add budget overview content
    if (data.budgetOverview && data.budgetOverview.length > 0) {
      let budgetY = doc.y + 20;
      data.budgetOverview.forEach(budget => {
        // Convert values to numbers and set defaults if undefined
        const spent = parseFloat(budget.spent) || 0;
        const budgetLimit = parseFloat(budget.budgetLimit) || 0;
        
        // Calculate progress with validation
        const progress = budgetLimit > 0 ? (spent / budgetLimit) * 100 : 0;
        const barWidth = 400;
        
        doc.fontSize(12)
           .fillColor('#000000')
           .text(budget.categoryName, 50, budgetY)
           .text(`RM ${spent.toFixed(2)} / RM ${budgetLimit.toFixed(2)}`, 50, budgetY + 20);

        // Draw background bar
        doc.rect(50, budgetY + 40, barWidth, 20)
           .fillColor('#EEEEEE')
           .fill();

        // Draw progress bar only if width is valid
        const progressWidth = Math.min(barWidth * (progress / 100), barWidth);
        if (progressWidth > 0) {
          doc.rect(50, budgetY + 40, progressWidth, 20)
             .fillColor(progress > 100 ? '#F44336' : '#151AA5')
             .fill();
        }

        // Add percentage text
        doc.fillColor('#000000')
           .text(`${progress.toFixed(1)}%`, 460, budgetY + 40);

        budgetY += 80;
      });
    } else {
      doc.fontSize(12)
         .fillColor('#666666')
         .text('No budget data available for this period.');
    }

    // Add page numbers
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(10)
         .fillColor('#666666')
         .text(
           `Page ${i + 1} of ${pages.count}`,
           50,
           doc.page.height - 50,
           { align: 'center' }
         );
    }

    doc.end();
  });
};

module.exports = {
  generateDashboardPDF
};