import React from "react";
import styles from "./Main.module.css";

function ActionButton({
  text,
  onClick,
  variant = "primary",
  disabled = false,
}) {
  return (
    <button className={styles.primary} onClick={onClick} disabled={disabled}>
      <div className={styles.basestatus2}>
        <div className={disabled ? styles.base3 : styles.base} />
      </div>
      <span className={disabled ? styles.text2 : styles.text}>{text}</span>
    </button>
  );
}

export default ActionButton;
