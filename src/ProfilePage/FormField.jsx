import React from 'react';
import styles from './FormField.module.css';

export function FormField({ label, type = 'text', placeholder, options, onChange }) {
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
          onChange={onChange}
        >
          <option value="">{placeholder}</option>
          {options
            ?.filter(option => option !== "Select your university" && option !== "Select your year of study")
            .map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
        </select>
      ) : (
        <input
          id={inputId}
          type={type}
          className={styles.input}
          placeholder={placeholder}
          onChange={onChange}
        />
      )}
    </div>
  );
}

export default FormField;
