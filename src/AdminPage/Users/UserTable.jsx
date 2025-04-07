import React from "react";
import styles from "./InputDesign.module.css";

const UserTable = ({ users }) => {
  const handleDelete = (userId) => {
    // Placeholder for delete logic
    console.log(`Delete user with ID: ${userId}`);
  };

  return (
    <div className={styles.div16}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.tr}>
            <th className={styles.th}>Name</th>
            <th className={styles.th2}>Email</th>
            <th className={styles.th3}>Date of Birth</th>
            <th className={styles.th4}>Role</th>
            <th className={styles.th5}>Phone Number</th>
            <th className={styles.th6}>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => {
            // Style variations for zebra-striping and unique rows
            const rowStyle = [
              styles.tr2,
              styles.tr3,
              styles.tr4,
              styles.tr5,
              styles.tr6,
              styles.tr7,
            ][index % 6];

            const actionCellStyle = [
              styles.td4,
              styles.td7,
              styles.td10,
              styles.td13,
              styles.td16,
              styles.td19,
            ][index % 6];

            const actionContainerStyle = [
              styles.div19,
              styles.div22,
              styles.div25,
              styles.div28,
              styles.div31,
              styles.div34,
            ][index % 6];

            // Format date if it exists
            const formatDate = (dateString) => {
              if (!dateString) return "";
              const date = new Date(dateString);
              return date.toLocaleDateString();
            };

            return (
              <tr key={user.userID} className={rowStyle}>
                <td className={styles.td}>{user.userName}</td>
                <td className={styles.td}>{user.userEmail}</td>
                <td className={styles.td}>{formatDate(user.userDOB)}</td>
                <td className={styles.td}>{user.userRole}</td>
                <td className={styles.td}>{user.userPhoneNumber}</td>
                <td className={actionCellStyle}>
                  <div className={actionContainerStyle}>
                    <button
                      onClick={() => handleDelete(user.userID)}
                      aria-label={`Delete user ${user.userName}`}
                    >
                      <img
                        src="/delete-icon.svg"
                        alt="Delete"
                        width="20"
                        height="20"
                      />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;