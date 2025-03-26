import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./PostCard.module.css";

function PostCard({ title, description, commentCount, date }) {
  return (
    <article className={styles.postCard}>
      <div className={styles.postContent}>
        <div className={styles.iconContainer}>
          <img src="/chat-icon.svg" alt="Chat" width="40" height="25" />
        </div>
        <div className={styles.postBody}>
          <div className={styles.textContent}>
            <h2 className={styles.postTitle}>{title}</h2>
            <p className={styles.postDescription}>{description}</p>
          </div>
          <div className={styles.postMeta}>
            <div className={styles.commentCount}>
              <img src="/chatGrey.svg" alt="Comments" width="20" height="15" />
              <span className={styles.metaText}>{commentCount}</span>
            </div>
            <div className={styles.postDate}>
              <img src="/calendarGrey.svg" alt="Date" width="14" height="14" />
              <span className={styles.metaText}>{date}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default PostCard;
