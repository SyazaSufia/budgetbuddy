import React from 'react';
import styles from './BudgetCard.module.css';

function BudgetCard({ title, description, isCreateNew }) {
  if (isCreateNew) {
    return (
      <article className={`${styles.card} ${styles.createNew}`}>
        <div className={styles.createNewContent}>
          <div className={styles.placeholder}>
            <div className={styles.rotatedBox}>
              <div className={styles.innerBox} />
            </div>
          </div>
          <h2 className={styles.createNewText}>Create new Budget</h2>
        </div>
      </article>
    );
  }

  return (
    <article className={styles.card}>
      <div className={styles.content}>
        <div className={styles.placeholder}>
          <div className={styles.rotatedBox}>
            <div className={styles.innerBox} />
          </div>
        </div>
      </div>
      <div className={styles.details}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </div>
    </article>
  );
}

export default BudgetCard;