import React from 'react';
import styles from './Dashboard.module.css';

export const DashboardCard = ({ icon, title, amount }) => {
  return (
    <article className={styles.dashboardCard}>
      <div className={styles.cardContent}>
        <img loading="lazy" src={icon} alt={`${title} icon`} className={styles.cardIcon} />
        <div className={styles.cardDetails}>
          <h3 className={styles.cardTitle}>{title}</h3>
          <p className={styles.cardAmount}>
            <span>RM</span>
            <span>{amount}</span>
          </p>
        </div>
      </div>
    </article>
  );
};

export default DashboardCard;