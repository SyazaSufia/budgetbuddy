import React, { useState } from 'react';
import styles from './StatusBadge.module.css';

function StatusBadge({ status }) {
  let badgeClass;
  
  switch (status.toLowerCase()) {
    case 'pending':
      badgeClass = styles.pending;
      break;
    case 'reviewed':
      badgeClass = styles.reviewed;
      break;
    case 'violated':
      badgeClass = styles.violated;
      break;
    default:
      badgeClass = styles.pending;
  }
  
  return (
    <div className={`${styles.badge} ${badgeClass}`}>
      {status}
    </div>
  );
}

export default StatusBadge;