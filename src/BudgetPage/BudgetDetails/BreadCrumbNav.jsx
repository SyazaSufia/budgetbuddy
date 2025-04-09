import React from "react";
import { Link } from "react-router-dom";
import styles from "./BudgetDetails.module.css";

function BreadcrumbNav({ categoryName }) {
  return (
    <nav className={styles.breadcrumbNav}>
      <Link to="/budget" className={styles.breadcrumbLink}>Budget</Link>
      <span className={styles.separator}>/</span>
      <span className={styles.breadcrumbActive}>
        {categoryName || "Budget Details"}
      </span>
    </nav>
  );
}

export default BreadcrumbNav;
