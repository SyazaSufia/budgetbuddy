import React from "react";
import styles from "./BudgetDetails.module.css";

function BreadcrumbNav() {
  return (
    <nav className={styles.div3}>
      <div className={styles.div4}>
        <span className={styles.div5}>Budget</span>
        <span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.33345 5L7.15845 6.175L10.9751 10L7.15845 13.825L8.33345 15L13.3334 10L8.33345 5Z"
              fill="black"
            />
          </svg>
        </span>
      </div>
      <span className={styles.div6}>Category Name</span>
    </nav>
  );
}

export default BreadcrumbNav;
