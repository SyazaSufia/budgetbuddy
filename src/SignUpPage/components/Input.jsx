import React from "react";
import styles from "./Input.module.css";

export const Input = ({ label, type, id, placeholder, value, onChange, icon }) => {
  return (
    <div className={styles.inputWrapper}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <div className={styles.inputContainer}>
        <input
          type={type}
          id={id}
          className={styles.input}
          placeholder={placeholder}
          aria-label={label}
          value={value}
          onChange={onChange}
        />
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>
    </div>
  );
};
