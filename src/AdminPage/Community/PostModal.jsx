import React from "react";
import styles from "./PostModal.module.css";
import StatusBadge from "./StatusBadge";

function PostModal({ post, onClose, onReview, onViolated }) {
  if (!post) return null;

  // Format the creation date
  const createdDate = post.createdAt 
    ? new Date(post.createdAt).toLocaleString() 
    : "Unknown date";

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Post Details</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.postMeta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Post ID:</span>
              <span className={styles.metaValue}>{post.postID}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Author:</span>
              <span className={styles.metaValue}>{post.username || "Unknown"}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Date:</span>
              <span className={styles.metaValue}>{createdDate}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Status:</span>
              <span className={styles.metaValue}>
                <StatusBadge status={post.status} />
              </span>
            </div>
          </div>
          
          <div className={styles.postContent}>
            <h3 className={styles.contentTitle}>{post.subject || "No Subject"}</h3>
            <div className={styles.contentText}>
              {post.fullContent || post.content}
            </div>
          </div>
        </div>
        
        <div className={styles.modalFooter}>
          <button className={styles.reviewButton} onClick={onReview}>
            Mark as Reviewed
          </button>
          <button className={styles.violationButton} onClick={onViolated}>
            Mark as Violated
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostModal;