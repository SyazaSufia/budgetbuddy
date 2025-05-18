import React from "react";
import styles from "./PostModal.module.css";

function PostModal({ post, onClose, onReview, onViolated }) {
  if (!post) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Post Details</h2>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabel}>Post ID:</div>
            <div className={styles.fieldValue}>{post.postID}</div>
          </div>
          
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabel}>User:</div>
            <div className={styles.fieldValue}>{post.username} (ID: {post.userID})</div>
          </div>
          
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabel}>Subject:</div>
            <div className={styles.fieldValue}>{post.subject}</div>
          </div>
          
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabel}>Date:</div>
            <div className={styles.fieldValue}>{post.date}</div>
          </div>
          
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabel}>Content:</div>
            <div className={styles.contentValue}>{post.fullContent || post.content}</div>
          </div>
        </div>
        
        <div className={styles.modalFooter}>
          <button 
            className={`${styles.actionButton} ${styles.violatedButton}`}
            onClick={() => onViolated(post.postID)}
          >
            Mark as Violated
          </button>
          
          <button 
            className={`${styles.actionButton} ${styles.reviewedButton}`}
            onClick={() => onReview(post.postID)}
          >
            Mark as Reviewed
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostModal;