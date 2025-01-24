import React from 'react';
import styles from './Input.module.css';

export const Input = ({ label, type, id, placeholder, value, onChange }) => {
  return (
    <div className={styles.inputWrapper}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <input
        type={type}
        id={id}
        className={styles.input}
        placeholder={placeholder}
        aria-label={label}
        value={value}            // Controlled value
        onChange={onChange}      // Controlled onChange handler
      />
    </div>
  );
};
