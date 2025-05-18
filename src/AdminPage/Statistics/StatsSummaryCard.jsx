import React from "react";
import styles from "./StatsSummaryCard.module.css";

const StatsSummaryCard = ({ title, value, icon, color, percentage, change }) => {
  // Determine the style for change indicator (positive or negative)
  const getChangeStyle = () => {
    if (!change) return null;
    
    const isPositive = change >= 0;
    const changeClassName = isPositive 
      ? styles.positiveChange 
      : styles.negativeChange;
    
    const changeIcon = isPositive
      ? "↑"
      : "↓";
    
    return (
      <div className={changeClassName}>
        <span className={styles.changeIcon}>{changeIcon}</span>
        <span className={styles.changeValue}>{Math.abs(change)}%</span>
      </div>
    );
  };

  return (
    <div className={styles.summaryCard} style={{ borderTopColor: color }}>
      <div className={styles.iconContainer} style={{ backgroundColor: color }}>
        <span className={styles.icon}>{icon}</span>
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <div className={styles.statsRow}>
          <p className={styles.value}>{value}</p>
          {percentage && (
            <p className={styles.percentage}>{percentage}%</p>
          )}
          {change !== undefined && getChangeStyle()}
        </div>
      </div>
    </div>
  );
};

export default StatsSummaryCard;