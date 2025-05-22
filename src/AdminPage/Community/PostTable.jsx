import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PostTable.module.css";
import PostModal from "./PostModal";
import { DeleteModal } from "./DeleteModal";

function PostTable({ initialPosts }) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);
  const apiUrl = import.meta.env.REACT_APP_API_URL || 'http://localhost:43210';

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
        const response = await fetch(`${apiUrl}/admin/community/posts`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        if (data.success) {
          // Ensure each post has content property even if it's empty
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [initialPosts, apiUrl]);

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
      const response = await fetch(`${apiUrl}/admin/community/posts/${selectedPost.postID}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'Reviewed' })
      });

      const data = await response.json();

      if (data.success) {
        // Update the post status in our local state
        setPosts(posts.map(post => 
          post.postID === selectedPost.postID ? { ...post, status: 'Reviewed' } : post
        ));
        // Update the selected post status
        setSelectedPost({...selectedPost, status: 'Reviewed'});
      } else {
        alert("Failed to update post status");
      }
    } catch (error) {
      console.error("Error updating post status:", error);
      alert("Failed to update post status. Please try again later.");
    }
  };

  // Handle update post status - Mark as Violated
  const handleMarkAsViolated = async () => {
    if (!selectedPost) return;
    
    try {
      const response = await fetch(`${apiUrl}/admin/community/posts/${selectedPost.postID}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'Violated' })
      });

      const data = await response.json();

      if (data.success) {
        // Update the post status in our local state
        setPosts(posts.map(post => 
          post.postID === selectedPost.postID ? { ...post, status: 'Violated' } : post
        ));
        // Update the selected post status
        setSelectedPost({...selectedPost, status: 'Violated'});
      } else {
        alert("Failed to update post status");
      }
    } catch (error) {
      console.error("Error updating post status:", error);
      alert("Failed to update post status. Please try again later.");
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
      const response = await fetch(`${apiUrl}/admin/community/posts/${postToDelete.postID}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        // Remove the post from our local state
        setPosts(posts.filter(post => post.postID !== postToDelete.postID));
        // Close the delete modal
        setPostToDelete(null);
      } else {
        alert("Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again later.");
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