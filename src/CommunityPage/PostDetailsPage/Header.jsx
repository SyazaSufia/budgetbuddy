import React from "react";
import styles from "./Main.module.css";

function Header({ user }) {
  return (
    <header className={styles.headersection}>
      <h1 className={styles.pageheader}>Hello, {user?.name || "Guest"}!</h1>
    </header>
  );
}

export default Header;
