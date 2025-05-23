import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./PostDetail.module.css";
import RichTextEditor from "../AddPostPage/RichTextEditor";
import SidebarNav from "../SideBar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatStandardDate } from '../../utils/dateUtils';
import { communityAPI } from "../../services/UserApi";

function PostDetail({ user }) {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Handle sidebar collapse state changes
  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  // Fetch post details when component mounts
  useEffect(() => {
    const fetchPostDetails = async () => {
      setIsLoading(true);
      try {
        const data = await communityAPI.getPostById(postId);

        if (data.success) {
          setPost(data.data);
        } else {
          throw new Error(data.error || "Unknown error occurred");
        }
      } catch (err) {
        console.error("Error fetching post details:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostDetails();
  }, [postId]);

  // Handle comment submission
  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) return;

    setIsSubmittingComment(true);

    try {
      const data = await communityAPI.addComment(postId, { content: commentText });

      if (data.success) {
        // Show success toast notification
        toast.success("Comment added successfully!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Refresh post to get the new comment
        const postData = await communityAPI.getPostById(postId);
        if (postData.success) {
          setPost(postData.data);
        }

        // Clear comment input
        setCommentText("");
      } else {
        throw new Error(data.error || "Unknown error occurred");
      }
    } catch (err) {
      toast.error(
        err.message || "Failed to submit comment. Please try again.",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle like/unlike post
  const handleToggleLike = async () => {
    if (!user) {
      toast.error("Please log in to like posts", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    setIsLiking(true);

    try {
      const data = await communityAPI.toggleLike(postId);

      if (data.success) {
        // Update post state with new like status
        setPost((prevPost) => ({
          ...prevPost,
          likes: {
            ...prevPost.likes,
            count: data.data.liked 
              ? prevPost.likes.count + 1 
              : prevPost.likes.count - 1,
            userLiked: data.data.liked,
          },
        }));

        // Show success toast notification
        toast.success(
          data.data.liked ? "Post liked!" : "Post unliked",
          {
            position: "top-right",
            autoClose: 3000,
          }
        );
      } else {
        throw new Error(data.error || "Unknown error occurred");
      }
    } catch (err) {
      toast.error(err.message || "Failed to like post. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsLiking(false);
    }
  };

  // Handle edit post
  const handleEditPost = () => {
    // Navigate to add post page with post ID for editing
    navigate(`/addpost?edit=${postId}`);
  };

  // Handle delete post
  const handleDeletePost = async () => {
    setIsDeleting(true);

    try {
      const data = await communityAPI.deletePost(postId);

      if (data.success) {
        toast.success("Post deleted successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        
        // Navigate back to community page
        navigate("/community");
      } else {
        throw new Error(data.error || "Unknown error occurred");
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete post. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Check if current user is the author of the post
  const isPostAuthor = () => {
    if (!user || !post) return false;
    return user.id === post.userID;
  };

  // Format the date using the utility function
  const formatDate = (dateString) => {
    return formatStandardDate(dateString);
  };

  return (
    <main className={styles.communityDefault}>
      <div
        className={`${styles.content} ${isSidebarCollapsed ? styles.sidebarCollapsed : ""}`}
      >
        <SidebarNav onToggleCollapse={handleSidebarToggle} />
        <section className={styles.main}>
          <div className={styles.postDetailContainer}>
            <div className={styles.backButtonContainer}>
              <button
                className={styles.backButton}
                onClick={() => navigate("/community")}
              >
                ← Back to Community
              </button>
            </div>

            {isLoading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading post...</p>
              </div>
            ) : error ? (
              <div className={styles.errorContainer}>
                <p className={styles.errorMessage}>{error}</p>
                <button
                  className={styles.returnButton}
                  onClick={() => navigate("/community")}
                >
                  Return to Community
                </button>
              </div>
            ) : post ? (
              <div className={styles.postWrapper}>
                <div className={styles.postHeader}>
                  <h1 className={styles.postTitle}>{post.subject}</h1>
                  
                  {/* Author actions section (conditionally rendered) */}
                  {isPostAuthor() && (
                    <div className={styles.authorActions}>
                      <button 
                        className={styles.editButton}
                        onClick={handleEditPost}
                      >
                        <img src="/edit-icon.svg" alt="Edit" width="16" height="16" />
                        Edit
                      </button>
                      <button 
                        className={styles.deleteButton}
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <img src="/delete-icon.svg" alt="Delete" width="16" height="16" />
                        Delete
                      </button>
                    </div>
                  )}
                  
                  <div className={styles.postInfo}>
                    <div className={styles.postAuthorContainer}>
                      {post.profileImage ? (
                        <img
                          src={post.profileImage}
                          alt={`${post.username}'s profile`}
                          className={styles.postAuthorImage}
                        />
                      ) : (
                        <div className={styles.defaultProfileImage}>
                          {post.username
                            ? post.username.charAt(0).toUpperCase()
                            : "?"}
                        </div>
                      )}
                      <span className={styles.postAuthor}>{post.username}</span>
                    </div>
                    <span className={styles.postDate}>
                      <img
                        src="/calendarGrey.svg"
                        alt="Date"
                        width="14"
                        height="14"
                      />
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                </div>

                <div
                  className={styles.postContent}
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Like section */}
                <div className={styles.likeSection}>
                  <button
                    className={`${styles.likeButton} ${post.likes?.userLiked ? styles.liked : ""}`}
                    onClick={handleToggleLike}
                    disabled={isLiking}
                  >
                    {post.likes?.userLiked ? (
                      <img src="/heart-filled.svg" alt="Unlike" width="20" height="20" />
                    ) : (
                      <img src="/heart-outline.svg" alt="Like" width="20" height="20" />
                    )}
                    <span>{post.likes?.userLiked ? "Liked" : "Like"}</span>
                  </button>
                  <span className={styles.likeCount}>
                    {post.likes?.count} {post.likes?.count === 1 ? "like" : "likes"}
                  </span>
                </div>

                <div className={styles.commentSection}>
                  <h2 className={styles.commentSectionHeader}>
                    Comments ({post.comments?.length || 0})
                  </h2>

                  {/* Comment form */}
                  <form
                    className={styles.commentForm}
                    onSubmit={handleSubmitComment}
                  >
                    <RichTextEditor
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={setCommentText}
                    />
                    <button
                      type="submit"
                      className={styles.commentButton}
                      disabled={isSubmittingComment || !commentText.trim()}
                    >
                      {isSubmittingComment ? "Posting..." : "Post Comment"}
                    </button>
                  </form>

                  <div className={styles.commentList}>
                    {post.comments && post.comments.length > 0 ? (
                      post.comments.map((comment) => (
                        <div
                          key={comment.commentID}
                          className={styles.commentItem}
                        >
                          <div className={styles.commentHeader}>
                            <div className={styles.commentAuthorContainer}>
                              {comment.profileImage ? (
                                <img
                                  src={comment.profileImage}
                                  alt={`${comment.username}'s profile`}
                                  className={styles.commentAuthorImage}
                                />
                              ) : (
                                <div className={styles.commentDefaultImage}>
                                  {comment.username
                                    ? comment.username.charAt(0).toUpperCase()
                                    : "?"}
                                </div>
                              )}
                              <div className={styles.commentAuthor}>
                                {comment.username}
                              </div>
                            </div>
                            <div className={styles.commentDate}>
                              {formatDate(comment.createdAt)}
                            </div>
                          </div>
                          <div
                            className={styles.commentContent}
                            dangerouslySetInnerHTML={{
                              __html: comment.content,
                            }}
                          />
                        </div>
                      ))
                    ) : (
                      <p className={styles.noComments}>
                        No comments yet. Be the first to comment!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.errorContainer}>
                <p className={styles.errorMessage}>Post not found</p>
                <button
                  className={styles.returnButton}
                  onClick={() => navigate("/community")}
                >
                  Return to Community
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal}>
            <h3>Delete Post</h3>
            <p>Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className={styles.modalButtons}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmDeleteButton}
                onClick={handleDeletePost}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      
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

export default PostDetail;