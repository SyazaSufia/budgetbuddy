import React from "react";
import styles from "./BudgetDetails.module.css";

function ActionButtons() {
  return (
    <section className={styles.div24}>
      <button className={styles.div25}>
        <div className={styles.div26}>
          <img
            src="/target-icon.svg"
            alt="Set Budget Icon"
          />
          <span className={styles.div27}>Set a Budget</span>
          <span>
          <img
            src="/chevron-right.svg"
            alt="Chevron right Icon"
          />
          </span>
        </div>
      </button>

      <button className={styles.div28}>
        <div className={styles.div29}>
          <img
            src="/customize-icon.png"
            alt="Customize Icon"
          />
          <span className={styles.div30}>Customize</span>
          <span>
          <img
            src="/chevron-right.svg"
            alt="Chevron right Icon"
          />
          </span>
        </div>
      </button>

      <button className={styles.div31}>
        <div className={styles.div32}>
          <img
            src="/deleteBlack-icon.svg"
            alt="Delete Icon"
          />
          <span className={styles.div33}>Delete Budget</span>
          <span>
          <img
            src="/chevron-right.svg"
            alt="Chevron right Icon"
          />
          </span>
        </div>
      </button>
    </section>
  );
}

export default ActionButtons;
