import React, { useEffect, useState } from "react";
import styles from "./InputDesign.module.css";
import UserTable from "./UserTable";
import { adminUserAPI } from "../../services/AdminApi";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await adminUserAPI.getAllUsers();
        
        if (data.success && data.data) {
          console.log("Users loaded:", data.data);
          setUsers(data.data);
        } else {
          setError("Failed to load users");
        }
      } catch (err) {
        console.error("Error loading users:", err);
        setError(`Error loading users: ${err.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <section className={styles.div}>
      <h1 className={styles.div2}>User Management</h1>
      <article className={styles.div3}>
        <header className={styles.div4}>
          <h2 className={styles.div5}>User Accounts</h2>
        </header>
        {loading ? (
          <div className={styles.loading}>Loading users...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <UserTable users={users} setUsers={setUsers} />
        )}
      </article>
    </section>
  );
};

export default UserManagement;