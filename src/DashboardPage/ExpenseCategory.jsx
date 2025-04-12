import React from 'react';
import styles from './Dashboard.module.css';

export const ExpenseCategory = ({ color, category, percentage, amount }) => {
  // Make sure we have a valid color - fallback to a default if not
  const validColor = (color && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) 
    ? color 
    : "#CCCCCC"; // Default grey if no valid color provided
  
  // For debugging
  console.log(`Expense category "${category}" color: ${color} -> ${validColor}`);
  
  return (
    <div className={styles.expenseItem}>
      <div className={styles.colorIndicator}>
        <div 
          className={styles.colorDot} 
          style={{ backgroundColor: validColor }} // Use validated color
        />
      </div>
      <div className={styles.expenseDetails}>
        <h4 className={styles.expenseCategory}>{category}</h4>
        <div className={styles.expensePercentage}>
          <span>{percentage}</span>
          <span>%</span>
        </div>
      </div>
      <div className={styles.expenseAmount}>
        <span>RM</span>
        <span>{amount}</span>
      </div>
    </div>
  );
};

export default ExpenseCategory;