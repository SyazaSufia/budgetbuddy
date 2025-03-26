import React from "react";
import styles from "./InputDesign.module.css";

const UserTable = ({ users }) => {
  const handleDelete = (userId) => {
    // Delete functionality would be implemented here
    console.log(`Delete user with ID: ${userId}`);
  };

  return (
    <div className={styles.div16}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.tr}>
            <th className={styles.th}>User ID</th>
            <th className={styles.th2}>Username</th>
            <th className={styles.th3}>Email</th>
            <th className={styles.th4}>Role</th>
            <th className={styles.th5}>Status</th>
            <th className={styles.th6}>Date Registered</th>
            <th className={styles.th7}>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => {
            // Determine which row style to use based on index
            const rowStyle = [
              styles.tr2,
              styles.tr3,
              styles.tr4,
              styles.tr5,
              styles.tr6,
              styles.tr7,
            ][index % 6];

            // Determine which cell styles to use based on index
            const roleCellStyle = [
              styles.td2,
              styles.td5,
              styles.td8,
              styles.td11,
              styles.td14,
              styles.td17,
            ][index % 6];

            const statusCellStyle = [
              styles.td3,
              styles.td6,
              styles.td9,
              styles.td12,
              styles.td15,
              styles.td18,
            ][index % 6];

            const actionCellStyle = [
              styles.td4,
              styles.td7,
              styles.td10,
              styles.td13,
              styles.td16,
              styles.td19,
            ][index % 6];

            const roleTextStyle = [
              styles.div17,
              styles.div20,
              styles.div23,
              styles.div26,
              styles.div29,
              styles.div32,
            ][index % 6];

            const statusTextStyle = [
              styles.div18,
              styles.div21,
              styles.div24,
              styles.div27,
              styles.div30,
              styles.div33,
            ][index % 6];

            const actionContainerStyle = [
              styles.div19,
              styles.div22,
              styles.div25,
              styles.div28,
              styles.div31,
              styles.div34,
            ][index % 6];

            return (
              <tr key={user.id} className={rowStyle}>
                <td className={styles.td}>{user.id}</td>
                <td className={styles.td}>{user.username}</td>
                <td className={styles.td}>{user.email}</td>
                <td className={roleCellStyle}>
                  <div className={roleTextStyle}>{user.role}</div>
                </td>
                <td className={statusCellStyle}>
                  <div className={statusTextStyle}>{user.status}</div>
                </td>
                <td className={styles.td}>{user.dateRegistered}</td>
                <td className={actionCellStyle}>
                  <div className={actionContainerStyle}>
                    <button
                      onClick={() => handleDelete(user.id)}
                      aria-label={`Delete user ${user.id}`}
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
