import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PostTable.module.css";
import PostModal from "./PostModal";
import { DeleteModal } from "./DeleteModal";
import { adminAPI } from "../../services/AdminApi";

// Simple toast notification component
const Toast = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span>{message}</span>
      <button onClick={onClose} className={styles.toastClose}>×</button>
    </div>
  );
};

function PostTable({ initialPosts }) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '', isVisible: false });

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  // Hide toast notification
  const hideToast = () => {
    setToast({ message: '', type: '', isVisible: false });
  };

  // Fetch posts from API if no initialPosts provided
  useEffect(() => {
    if (initialPosts) {
      setPosts(initialPosts);
      setIsLoading(false);
      return;
    }

    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const data = await adminAPI.community.getAllPosts();

        if (data.success) {
          const processedPosts = data.data.map(post => ({
            ...post,
            content: post.content || ""
          }));
          setPosts(processedPosts);
        } else {
          throw new Error(data.error || 'Unknown error occurred');
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        showToast("Failed to load posts", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [initialPosts]);

  // Handle view post details
  const handleViewPost = (post) => {
    setSelectedPost(post);
  };

  // Handle close post modal
  const handleCloseModal = () => {
    setSelectedPost(null);
  };

  // Handle update post status - Mark as Reviewed
  const handleMarkAsReviewed = async () => {
    if (!selectedPost) return;
    
    try {
      // Use the new updatePostStatus method
      const data = await adminAPI.community.updatePostStatus(selectedPost.postID, 'Reviewed');

      if (data.success) {
        setPosts(posts.map(post => 
          post.postID === selectedPost.postID ? { ...post, status: 'Reviewed' } : post
        ));
        setSelectedPost({...selectedPost, status: 'Reviewed'});
        showToast("Post marked as reviewed successfully", "success");
      } else {
        showToast("Failed to update post status", "error");
      }
    } catch (error) {
      console.error("Error updating post status:", error);
      showToast("Failed to update post status. Please try again later.", "error");
    }
  };

  // Handle update post status - Mark as Violated
  const handleMarkAsViolated = async () => {
    if (!selectedPost) return;
    
    try {
      // Use the new updatePostStatus method
      const data = await adminAPI.community.updatePostStatus(selectedPost.postID, 'Violated');

      if (data.success) {
        setPosts(posts.map(post => 
          post.postID === selectedPost.postID ? { ...post, status: 'Violated' } : post
        ));
        setSelectedPost({...selectedPost, status: 'Violated'});
        showToast("Post marked as violated successfully", "success");
      } else {
        showToast("Failed to update post status", "error");
      }
    } catch (error) {
      console.error("Error updating post status:", error);
      showToast("Failed to update post status. Please try again later.", "error");
    }
  };

  // Handle show delete confirmation modal
  const handleShowDeleteModal = (post) => {
    setPostToDelete(post);
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setPostToDelete(null);
  };

  // Handle confirm delete post
  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    
    try {
      const data = await adminAPI.community.deletePost(postToDelete.postID);

      if (data.success) {
        setPosts(posts.filter(post => post.postID !== postToDelete.postID));
        setPostToDelete(null);
        showToast("Post deleted successfully", "success");
      } else {
        showToast("Failed to delete post", "error");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      showToast("Failed to delete post. Please try again later.", "error");
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading posts...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No posts found.</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      {/* Toast Notification */}
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      <table className={styles.postsTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map(post => (
            <tr key={post.postID}>
              <td>{post.postID}</td>
              <td className={styles.titleColumn} title={post.subject}>
                {post.subject || "[No title]"}
              </td>
              <td>{new Date(post.createdAt).toLocaleDateString()}</td>
              <td>
                <div className={`${styles.statusBadge} ${styles[post.status?.toLowerCase() || 'pending']}`}>
                  {post.status || 'Pending'}
                </div>
              </td>
              <td>
                <div className={styles.actionsCell}>
                  <button 
                    className={`${styles.actionButton} ${styles.viewButton}`}
                    onClick={() => handleViewPost(post)}
                    aria-label="View post"
                  >
                    <img src="/view-icon.svg" alt="View" width="20" height="20" />
                  </button>
                  <button 
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => handleShowDeleteModal(post)}
                    aria-label="Delete post"
                  >
                    <img src="/delete-icon.svg" alt="Delete" width="20" height="20" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Post Modal */}
      {selectedPost && (
        <PostModal 
          post={selectedPost}
          onClose={handleCloseModal}
          onReview={handleMarkAsReviewed}
          onViolated={handleMarkAsViolated}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <DeleteModal 
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          userName={postToDelete.subject || `Post #${postToDelete.postID}`}
        />
      )}
    </div>
  );
}

export default PostTable;