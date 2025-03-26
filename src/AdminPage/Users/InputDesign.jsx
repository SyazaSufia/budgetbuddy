import React from "react";
import UserManagement from "./UserManagement";
import SidebarNav from "./SideBar";
import styles from "./InputDesign.module.css";

const InputDesign = () => {
  return (
    <main className={styles.container}>
      <div className={styles.sidebar}>
        <SidebarNav />
      </div>
      <section className={styles.content}>
        <UserManagement />
      </section>
    </main>
  );
};

export default InputDesign;
