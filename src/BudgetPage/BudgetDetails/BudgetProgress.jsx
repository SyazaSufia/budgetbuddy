import React from "react";
import styles from "./BudgetDetails.module.css";

function BudgetProgress({ current, total }) {
  // Calculate percentage for progress bar
  const percentage = (current / total) * 100;

  return (
    <article className={styles.div9}>
      <div className={styles.div10}>
        <div className={styles.div11}>
          <div className={styles.div12}>
          </div>
          <h2 className={styles.div14}>Budget</h2>
        </div>
        <div className={styles.div15}>
          <div className={styles.div16}>
            <div className={styles.div17}>
              <span className={styles.div18}>{current}</span>
            </div>
            <div className={styles.div19}>
              <span className={styles.div20}>/</span>
              <span className={styles.div21}>{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.div22}>
        <div className={styles.div23} style={{ width: `${percentage}%` }} />
      </div>
    </article>
  );
}

export default BudgetProgress;
