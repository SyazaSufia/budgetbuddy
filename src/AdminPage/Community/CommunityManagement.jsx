import React, { useState } from "react";
import styles from "./CommunityManagement.module.css";
import PostTable from "./PostTable";
import SidebarNav from "./SideBar";
import { adminAPI } from "../../services/AdminApi";

function CommunityManagement() {
  const [filteredPosts, setFilteredPosts] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setFilteredPosts(null);
      return;
    }
    
    try {
      // Use the adminAPI instead of hardcoded URL
      const data = await adminAPI.community.getAllPosts(1, 50, "all", searchTerm);
      
      if (data.success) {
        setFilteredPosts(data.data);
      } else {
        alert("Failed to search posts");
      }
    } catch (err) {
      console.error("Error searching posts:", err);
      alert("Failed to search posts. Please try again later.");
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setFilteredPosts(null);
  };

  return (
    <main className={styles.container}>
      <SidebarNav />
      <section className={styles.content}>
        <h1 className={styles.title}>Community Management</h1>
        <div className={styles.card}>
          <header className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Community Posts</h2>
            <form className={styles.searchForm} onSubmit={handleSearch}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className={styles.searchButton}>Search</button>
              {filteredPosts && (
                <button 
                  type="button" 
                  className={styles.clearButton}
                  onClick={handleClearSearch}
                >
                  Clear Search
                </button>
              )}
            </form>
          </header>
          <PostTable initialPosts={filteredPosts} />
        </div>
      </section>
    </main>
  );
}

export default CommunityManagement;