import React from "react";
import styles from "./StatusBadge.module.css";

function StatusBadge({ status }) {
  const getStatusClass = () => {
    switch (status) {
      case "Pending":
        return styles.pending;
      case "Reviewed":
        return styles.reviewed;
      case "Violated":
        return styles.violated;
      default:
        return styles.pending; // Default to pending if status is unknown
    }
  };

  return (
    <div className={`${styles.badge} ${getStatusClass()}`}>
      {status || "Pending"}
    </div>
  );
}

export default StatusBadge;