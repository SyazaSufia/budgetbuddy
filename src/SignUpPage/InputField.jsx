import React from 'react';
import styles from './InputField.module.css';

const InputField = ({ label, type, id, placeholder, value, onChange }) => {
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

export default InputField;
