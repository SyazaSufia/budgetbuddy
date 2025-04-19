import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styles from "./Community.module.css";
import SidebarNav from "./SideBar";
import ForumFeed from "./ForumFeed";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Community({ user }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Handle sidebar collapse state changes
  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  // Check for toast messages in URL when component mounts or location changes
  useEffect(() => {
    // Check for toast message in URL parameters
    const queryParams = new URLSearchParams(location.search);
    const toastType = queryParams.get('toast');
    const message = queryParams.get('message');
    
    if (toastType && message) {
      // Show the toast message
      if (toastType === 'success') {
        toast.success(message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      } else if (toastType === 'error') {
        toast.error(message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      }
      
      // Clean up the URL (optional)
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location]);

  return (
    <main className={styles.communityDefault}>
      <div className={`${styles.content} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
        <SidebarNav onToggleCollapse={handleSidebarToggle} />
        <section className={styles.main}>
          <ForumFeed user={user} />
        </section>
      </div>
      {/* Add ToastContainer to display toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
      />
    </main>
  );
}

export default Community;