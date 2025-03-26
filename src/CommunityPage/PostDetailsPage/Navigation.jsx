import React from "react";
import styles from "./Main.module.css";

function Navigation({ parentSection, currentPage }) {
  return (
    <nav className={styles.navigations}>
      <div className={styles.navigationbutton}>
        <span className={styles.title}>{parentSection}</span>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/312a15e19dfc79c4cc7a94b84c93b95c97a0dfdf?placeholderIfAbsent=true&apiKey=0b94a44883f24936b29ca07e81963b97"
          alt="Navigation arrow"
          className={styles.img}
        />
      </div>
      <span className={styles.navigationbutton2}>{currentPage}</span>
    </nav>
  );
}

export default Navigation;
