import React, { useEffect, useState } from "react";
import styles from "./InputDesign.module.css";
import SearchInput from "./SearchInput";
import UserTable from "./UserTable";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/admin/users", {
      credentials: "include", // for session auth if needed
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }
        return res.json();
      })
      .then((data) => {
        if (data.success && data.data) {
          console.log("Users loaded:", data.data); // Log the user data
          setUsers(data.data); // Assuming the users are under the 'data' key
        } else {
          setError("Failed to load users");
        }
      })
      .catch((err) => {
        console.error("Error loading users:", err);
        setError("Error loading users");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className={styles.div}>
      <h1 className={styles.div2}>User Management</h1>
      <article className={styles.div3}>
        <header className={styles.div4}>
          <h2 className={styles.div5}>User Accounts</h2>
          <SearchInput />
        </header>
        {loading ? (
          <div className={styles.loading}>Loading users...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <UserTable users={users} />
        )}
      </article>
    </section>
  );
};

export default UserManagement;
