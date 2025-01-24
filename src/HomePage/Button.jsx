import React from 'react';
import styles from './Button.module.css';

const Button = ({ text, variant, onClick, disabled }) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default Button;