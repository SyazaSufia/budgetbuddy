import React from "react";
import styles from "./BudgetDetails.module.css";

function HistorySection() {
  const historyItems = [
    { date: "15-10-2024", amount: "260.00" },
    { date: "15-09-2024", amount: "180.00" },
  ];

  return (
    <section className={styles.div34}>
      <h2 className={styles.div35}>History</h2>
      <ul className={styles.div36}>
        {historyItems.map((item, index) => (
          <li key={index} className={index === 0 ? styles.div37 : styles.div43}>
            <div className={index === 0 ? styles.div38 : styles.div44}>
              <time className={index === 0 ? styles.div39 : styles.div45}>
                {item.date}
              </time>
              <div className={index === 0 ? styles.div40 : styles.div46}>
                <span className={index === 0 ? styles.div41 : styles.div47}>
                  RM
                </span>
                <span className={index === 0 ? styles.div42 : styles.div48}>
                  {item.amount}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default HistorySection;
