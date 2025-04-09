import React from 'react';
import styles from './Dashboard.module.css';

export const ExpenseCategory = ({ color, category, percentage, amount }) => {
  return (
    <div className={styles.expenseItem}>
      <div className={styles.colorIndicator}>
        <div className={styles.colorDot} style={{ backgroundColor: color }} />
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