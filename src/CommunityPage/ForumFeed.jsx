import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ForumFeed.module.css";
import PostCard from "./PostCard";

function ForumFeed({ user }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6, // Show 6 posts at a time (2 rows of 3)
    totalPages: 1
  });

  // Function to fetch posts from your API
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/community/posts?page=${pagination.page}&limit=${pagination.limit}`,
        {
          credentials: 'include' // Include session cookies
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data.posts);
        setPagination({
          ...pagination,
          totalPages: data.data.pagination.totalPages
        });
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch posts when component mounts or pagination changes
  useEffect(() => {
    fetchPosts();
  }, [pagination.page, pagination.limit]);

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  const handleAddPost = () => {
    navigate("/addpost");
  };

  const handlePostClick = (postId) => {
    navigate(`/postdetails/${postId}`);
  };

  // Function to create rows of posts
  const renderPostRows = () => {
    // If no posts, show a message
    if (posts.length === 0 && !isLoading) {
      return (
        <div className={styles.noPostsMessage}>
          No posts found. Be the first to create a post!
        </div>
      );
    }

    // Split posts into rows of 3
    const rows = [];
    for (let i = 0; i < posts.length; i += 3) {
      const rowPosts = posts.slice(i, i + 3);
      rows.push(
        <div key={`row-${i}`} className={styles.postRow}>
          {rowPosts.map(post => (
            <div 
              key={post.postID} 
              className={styles.postCardWrapper}
              onClick={() => handlePostClick(post.postID)}
            >
              <PostCard post={post} />
            </div>
          ))}
        </div>
      );
    }
    return rows;
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <section className={styles.feedContainer}>
        <header className={styles.feedHeader}>
          <h1 className={styles.greeting}>Hello, {user?.name || "Guest"}!</h1>
        </header>
        
        <div className={styles.feedContent}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading posts...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <p className={styles.errorMessage}>{error}</p>
              <button 
                className={styles.retryButton}
                onClick={fetchPosts}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {renderPostRows()}
              
              {/* Pagination controls */}
              {pagination.totalPages > 1 && (
                <div className={styles.paginationControls}>
                  <button 
                    className={styles.paginationButton}
                    disabled={pagination.page === 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    Previous
                  </button>
                  
                  <span className={styles.pageIndicator}>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  
                  <button 
                    className={styles.paginationButton}
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
          
          <div className={styles.actionContainer}>
            <button className={styles.addButton} onClick={handleAddPost}>
              <img
                src="/add-icon.svg"
                alt="Add Icon"
                className={styles.addIcon}
              />
              Add New Post
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default ForumFeed;