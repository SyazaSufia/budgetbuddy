import React from 'react';
import styles from './Income.module.css';

const timeFilters = [
  { id: 'thisMonth', label: 'This month', active: true },
  { id: 'lastMonth', label: 'Last month' },
  { id: 'thisYear', label: 'This year' },
  { id: 'last12Months', label: 'Last 12 months' }
];

export default function TimeFilter() {
  return (
    <div className={styles.buttons}>
      <div className={styles.buttonGroup} role="tablist">
        {timeFilters.map(filter => (
          <button
            key={filter.id}
            role="tab"
            aria-selected={filter.active}
            className={`${styles[filter.id]} ${filter.active ? styles.active : ''}`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}