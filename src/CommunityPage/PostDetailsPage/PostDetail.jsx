import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./PostDetail.module.css";
import { format } from "date-fns";
import RichTextEditor from "../AddPostPage/RichTextEditor";
import SidebarNav from "../SideBar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function PostDetail({ user }) {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Handle sidebar collapse state changes
  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  // Fetch post details when component mounts
  useEffect(() => {
    const fetchPostDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8080/community/posts/${postId}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch post details");
        }

        const data = await response.json();

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
      const response = await fetch(
        `http://localhost:8080/community/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: commentText }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit comment");
      }

      const data = await response.json();

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
        const postResponse = await fetch(
          `http://localhost:8080/community/posts/${postId}`,
          {
            credentials: "include",
          }
        );

        if (postResponse.ok) {
          const postData = await postResponse.json();
          if (postData.success) {
            setPost(postData.data);
          }
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

  // Format the date nicely
  const formatDate = (dateString) => {
    return format(new Date(dateString), "MMMM d, yyyy h:mm a");
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
