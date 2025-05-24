import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./InputDesign.module.css";
import { DeleteModal } from "./DeleteModal";
import { adminUserAPI } from "../../services/AdminApi";

const UserTable = ({ users, setUsers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const openModal = (userId) => {
    setSelectedUser(userId);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedUser) {
      toast.error("No user selected for deletion");
      return;
    }
  
    const userToDelete = users.find((user) => user.userID === selectedUser);
    const userName = userToDelete?.userName || `ID: ${selectedUser}`;
    
    try {
      const data = await adminUserAPI.deleteUser(selectedUser);
      console.log(`User with ID ${selectedUser} deleted successfully`);
      setUsers(users.filter((user) => user.userID !== selectedUser));
      setIsModalOpen(false);
      toast.success(`User ${userName} was successfully deleted!`);
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error(`Error deleting user: ${err.message || "Unknown error"}`);
    }
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
  };

  // Format date if it exists
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className={styles.tableContainer}>
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
      
      <table className={styles.modernTable}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Date of Birth</th>
            <th>Role</th>
            <th>Phone Number</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr className={styles.noDataRow}>
              <td colSpan="6">No users found</td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.userID}>
                <td>{user.userName}</td>
                <td>{user.userEmail}</td>
                <td>{formatDate(user.userDOB)}</td>
                <td>
                  <span className={`${styles.roleBadge} ${styles[`role${user.userRole}`]}`}>
                    {user.userRole}
                  </span>
                </td>
                <td>{user.userPhoneNumber}</td>
                <td>
                  <button
                    className={styles.deleteButton}
                    onClick={() => openModal(user.userID)}
                    aria-label={`Delete user ${user.userName}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4H3.33333H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5.33334 4V2.66667C5.33334 2.31305 5.47382 1.97391 5.7239 1.72386C5.97398 1.47381 6.31311 1.33334 6.66668 1.33334H9.33334C9.68691 1.33334 10.026 1.47381 10.2761 1.72386C10.5262 1.97391 10.6667 2.31305 10.6667 2.66667V4M12.6667 4V13.3333C12.6667 13.687 12.5262 14.0261 12.2761 14.2762C12.026 14.5262 11.6869 14.6667 11.3333 14.6667H4.66668C4.31311 14.6667 3.97398 14.5262 3.7239 14.2762C3.47382 14.0261 3.33334 13.687 3.33334 13.3333V4H12.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6.66666 7.33334V11.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9.33334 7.33334V11.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {isModalOpen && (
        <DeleteModal 
          onCancel={cancelDelete} 
          onConfirm={handleDelete} 
          userName={users.find((user) => user.userID === selectedUser)?.userName}
        />
      )}
    </div>
  );
};

export default UserTable;