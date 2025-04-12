import React, { useState, useEffect } from 'react';

const ExpensePieChart = ({ categories }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [animatedSlices, setAnimatedSlices] = useState([]);
  
  useEffect(() => {
    // Debug: Check what categories are being received
    console.log("Categories passed to pie chart:", categories);
  }, [categories]);

  // If no categories or empty array, show empty state
  if (!categories || categories.length === 0) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="45" fill="#f0f0f0" />
        <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="6" fill="#666">
          No expense data
        </text>
      </svg>
    );
  }

  // Calculate total for percentage
  const total = categories.reduce((sum, category) => sum + parseFloat(category.amount), 0);
  
  // Calculate the slices for the pie chart
  useEffect(() => {
    let currentAngle = 0;
    // Ensure we have valid categories with colors
    const validCategories = categories.filter(cat => 
      cat && typeof cat.amount === 'number' || typeof cat.amount === 'string'
    );
    
    // Default colors to use if category color is missing
    const defaultColors = [
      "#FF6B6B", "#4ECDC4", "#FFD166", "#6A0572", 
      "#1A535C", "#F25F5C", "#247BA0", "#70C1B3", 
      "#B2DBBF", "#F3FFBD"
    ];
    
    const slices = validCategories.map((category, index) => {
      // Make sure we have a valid color - either from category or fallback
      const color = (category.color && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(category.color)) 
        ? category.color 
        : defaultColors[index % defaultColors.length];
      
      const percentage = total > 0 ? (parseFloat(category.amount) / total) * 100 : 0;
      const angle = (percentage / 100) * 360;
      
      // Calculate the SVG arc path
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;
      
      // Convert angles to radians
      const startRad = (startAngle - 90) * Math.PI / 180;
      const endRad = (endAngle - 90) * Math.PI / 180;
      
      // Calculate the points for the arc
      const radius = 40;
      const centerX = 50;
      const centerY = 50;
      
      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);
      
      // Large arc flag is 1 if angle > 180 degrees
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      // Create the SVG path for the slice
      const path = `
        M ${centerX} ${centerY}
        L ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        Z
      `;
      
      // For the "popped out" effect when hovering
      const popRadius = radius + 5;
      const midAngleRad = (startRad + endRad) / 2;
      const popX = centerX + 5 * Math.cos(midAngleRad);
      const popY = centerY + 5 * Math.sin(midAngleRad);
      
      const popPath = `
        M ${centerX} ${centerY}
        L ${x1 + (popX - centerX)} ${y1 + (popY - centerY)}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2 + (popX - centerX)} ${y2 + (popY - centerY)}
        Z
      `;
      
      return {
        path,
        popPath,
        color, // Now ensuring this is valid
        category: category.category,
        amount: parseFloat(category.amount).toFixed(2),
        percentage
      };
    });
    
    setAnimatedSlices(slices);
  }, [categories, total]);

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Background circle (optional) */}
      <circle cx="50" cy="50" r="48" fill="#f8f8f8" />
      
      {/* Pie Slices */}
      <g>
        {animatedSlices.map((slice, index) => (
          <path
            key={index}
            d={hoveredIndex === index ? slice.popPath : slice.path}
            fill={slice.color} // Using the validated color
            stroke="#fff"
            strokeWidth="0.5"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{ 
              transition: 'all 0.3s ease-out',
              filter: hoveredIndex === index ? 'drop-shadow(0px 0px 5px rgba(0,0,0,0.3))' : 'none',
              cursor: 'pointer'
            }}
          />
        ))}
      </g>
      
      {/* Hover info */}
      {hoveredIndex !== null && animatedSlices[hoveredIndex] && (
        <g>
          <rect
            x="30"
            y="40"
            width="40"
            height="20"
            rx="2"
            fill="white"
            stroke="#e0e0e0"
            strokeWidth="0.5"
            style={{ filter: 'drop-shadow(0px 0px 3px rgba(0,0,0,0.2))' }}
          />
          <text x="50" y="47" textAnchor="middle" fontSize="3.5" fontWeight="bold">
            {animatedSlices[hoveredIndex].category}
          </text>
          <text x="50" y="53" textAnchor="middle" fontSize="3.5">
            ${animatedSlices[hoveredIndex].amount} • {animatedSlices[hoveredIndex].percentage.toFixed(1)}%
          </text>
        </g>
      )}
      
      {/* No data indicator if there are categories but no values */}
      {total === 0 && (
        <>
          <circle cx="50" cy="50" r="40" fill="#f0f0f0" />
          <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="6" fill="#666">
            No expenses
          </text>
        </>
      )}
    </svg>
  );
};

export default ExpensePieChart;