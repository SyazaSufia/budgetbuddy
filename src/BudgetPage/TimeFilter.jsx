import React from 'react';
import styles from './Budget.module.css';

const timeFilters = [
  { id: 'thisMonth', label: 'This month' },
  { id: 'lastMonth', label: 'Last month' },
  { id: 'thisYear', label: 'This year' },
  { id: 'last12Months', label: 'Last 12 months' }
];

export default function TimeFilter({ activeFilter, onFilterChange }) {
  return (
    <div className={styles.buttons}>
      <div className={styles.buttonGroup} role="tablist">
        {timeFilters.map(filter => (
          <button
            key={filter.id}
            role="tab"
            aria-selected={filter.id === activeFilter}
            className={`${styles.filterButton} ${filter.id === activeFilter ? styles.active : ''}`}
            onClick={() => onFilterChange(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}