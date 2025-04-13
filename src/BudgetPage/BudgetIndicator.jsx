import React from 'react';
import styles from './BudgetIndicator.module.css';

const BudgetIndicator = ({ currentAmount, targetAmount }) => {
  // Return null if no target amount is set
  if (!targetAmount) return null;
  
  const percentage = (currentAmount / targetAmount) * 100;
  
  let statusClass = '';
  let message = '';
  
  if (percentage >= 100) {
    statusClass = styles.exceeded;
    message = 'Budget exceeded!';
  } else if (percentage >= 80) {
    statusClass = styles.warning;
    message = 'Approaching budget limit';
  } else if (percentage >= 50) {
    statusClass = styles.cautious;
    message = 'Budget in good standing';
  } else {
    statusClass = styles.good;
    message = 'Well within budget';
  }
  
  return (
    <div className={`${styles.indicator} ${statusClass}`}>
      <div className={styles.iconContainer}>
        {percentage >= 80 ? (
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <div className={styles.message}>{message}</div>
      <div className={styles.percentage}>{percentage.toFixed(0)}%</div>
    </div>
  );
};

export default BudgetIndicator;