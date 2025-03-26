import React from "react";
import styles from "./StatusBadge.module.css";

function StatusBadge({ status }) {
  return (
    <div className={styles.badgeContainer}>
      <div className={styles.badgeBorder} />
      <div className={styles.badgeContent}>
        <div className={styles.badgeTextWrapper}>
          <span className={styles.badgeText}>{status}</span>
        </div>
        <div className={styles.badgeCorner}>
          <div
            dangerouslySetInnerHTML={{
              __html: `<svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg" class="${styles.cornerIcon}"> <path d="M0 6.00076H5C5.55228 6.00076 6 5.55305 6 5.00076V0.000732422L0 6.00076Z" fill="#424242"></path> </svg>`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default StatusBadge;
