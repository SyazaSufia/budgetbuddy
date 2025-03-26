import React from "react";
import styles from "./InputDesign.module.css";
import SearchInput from "./SearchInput";
import UserTable from "./UserTable";

const UserManagement = () => {
  const users = [
    {
      id: "user0001",
      username: "John Doe",
      email: "john@email.com",
      role: "User",
      status: "Active",
      dateRegistered: "11-07-2023",
    },
    {
      id: "user0002",
      username: "Bob Doe",
      email: "bob@email.com",
      role: "User",
      status: "Suspended",
      dateRegistered: "11-07-2023",
    },
    {
      id: "user0003",
      username: "Mike Doe",
      email: "mike@email.com",
      role: "User",
      status: "Active",
      dateRegistered: "11-07-2023",
    },
    {
      id: "user0004",
      username: "Jake Doe",
      email: "Jake@email.com",
      role: "User",
      status: "Active",
      dateRegistered: "11-07-2023",
    },
    {
      id: "user0005",
      username: "Billy Doe",
      email: "Billy@email.com",
      role: "User",
      status: "Active",
      dateRegistered: "11-07-2023",
    },
    {
      id: "adm0001",
      username: "Mark Doe",
      email: "admin@email.com",
      role: "Admin",
      status: "Active",
      dateRegistered: "11-07-2023",
    },
  ];

  return (
    <section className={styles.div}>
      <h1 className={styles.div2}>User Management</h1>
      <article className={styles.div3}>
        <header className={styles.div4}>
          <h2 className={styles.div5}>User Accounts</h2>
          <SearchInput />
        </header>
        <UserTable users={users} />
      </article>
    </section>
  );
};

export default UserManagement;
