import React from 'react';
import styles from './FormField.module.css';

export function FormField({ label, type = 'text', placeholder, options }) {
  const inputId = `${label.toLowerCase().replace(/\s+/g, '-')}-input`;
  
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}:
      </label>
      {type === 'select' ? (
        <select 
          id={inputId}
          className={styles.select}
        >
          <option value="">{placeholder}</option>
          {options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={inputId}
          type={type}
          className={styles.input}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

export default FormField;