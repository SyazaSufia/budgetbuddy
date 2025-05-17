import React, { useState, useEffect } from "react";
import styles from "./PostTable.module.css";
import PostTableRow from "./PostTableRow";

function PostTable({ initialPosts }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  useEffect(() => {
    // If initialPosts is provided (from search), use that data
    if (initialPosts) {
      setPosts(initialPosts);
      setLoading(false);
      return;
    }
    
    // Otherwise fetch posts when component mounts
    fetchPosts();
  }, [initialPosts]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/admin/community/posts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include cookies for authentication
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data);
      } else {
        setError("Failed to load posts");
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const response = await fetch(`${apiUrl}/admin/community/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove the deleted post from state
        setPosts(posts.filter(post => post.postID !== postId));
      } else {
        alert("Failed to delete post");
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post. Please try again later.");
    }
  };

  const handleUpdateStatus = async (postId, newStatus) => {
    try {
      const response = await fetch(`${apiUrl}/admin/community/posts/${postId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update the post status in state
        setPosts(posts.map(post => 
          post.postID === postId ? { ...post, status: newStatus } : post
        ));
      } else {
        alert("Failed to update post status");
      }
    } catch (err) {
      console.error("Error updating post status:", err);
      alert("Failed to update post status. Please try again later.");
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading posts...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableContent}>
        <div className={styles.tableHeader}>
          <div className={styles.idHeader}>Post ID</div>
          <div className={styles.contentHeader}>Content</div>
          <div className={styles.dateHeader}>Post Date</div>
          <div className={styles.statusHeader}>Status</div>
          <div className={styles.actionHeader}>Action</div>
        </div>

        {posts.length > 0 ? (
          posts.map((post) => (
            <PostTableRow
              key={post.postID}
              id={post.postID}
              content={post.content}
              date={post.date}
              status={post.status || "Pending"}
              onDelete={() => handleDeletePost(post.postID)}
              onUpdateStatus={(newStatus) => handleUpdateStatus(post.postID, newStatus)}
            />
          ))
        ) : (
          <div className={styles.noData}>No posts found</div>
        )}
      </div>
    </div>
  );
}

export default PostTable;