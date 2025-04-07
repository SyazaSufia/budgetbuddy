import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./InputDesign.module.css";
import { DeleteModal } from "./DeleteModal";

const UserTable = ({ users, setUsers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const openModal = (userId) => {
    setSelectedUser(userId);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (!selectedUser) {
      toast.error("No user selected for deletion");
      return;
    }
  
    const userToDelete = users.find((user) => user.userID === selectedUser);
    const userName = userToDelete?.userName || `ID: ${selectedUser}`;
    
    fetch(`http://localhost:8080/admin/users/${selectedUser}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.message || "Failed to delete user");
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log(`User with ID ${selectedUser} deleted successfully`);
        // Update the users state to remove the deleted user
        setUsers(users.filter((user) => user.userID !== selectedUser));
        setIsModalOpen(false);
        
        // Show success toast notification
        toast.success(`User ${userName} was successfully deleted!`);
      })
      .catch((err) => {
        console.error("Error deleting user:", err);
        // Show error toast notification
        toast.error(`Error deleting user: ${err.message || "Unknown error"}`);
      });
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={styles.div16}>
      {/* Add ToastContainer component */}
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
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
                      onClick={() => openModal(user.userID)}
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
      {/* Include DeleteModal */}
      {isModalOpen && (
        <DeleteModal 
        onCancel={cancelDelete} 
        onConfirm={handleDelete} 
        userName={users.find((user) => user.userID === selectedUser)?.userName}/>
      )}
    </div>
  );
};

export default UserTable;