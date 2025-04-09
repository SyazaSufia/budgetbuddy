import React from 'react';
import styles from './Dashboard.module.css';

export const ActionCard = ({ icon, title, description, variant }) => {
  return (
    <article className={`${styles.actionCard} ${styles[variant]}`}>
      <div className={styles.actionIcon}>
        <img loading="lazy" src={icon} alt="" className={styles.actionImg} />
      </div>
      <div className={styles.actionText}>
        <h3 className={styles.actionTitle}>{title}</h3>
        <p className={styles.actionDescription}>{description}</p>
      </div>
    </article>
  );
};

export default ActionCard;