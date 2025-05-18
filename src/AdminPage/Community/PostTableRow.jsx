import React from "react";
import styles from "./PostTableRow.module.css";

function PostTableRow({ id, content, date, onDelete, onView }) {
  const handleDelete = () => {
    // Confirm before deletion
    if (window.confirm(`Are you sure you want to delete post ${id}?`)) {
      onDelete();
    }
  };

  return (
    <div className={styles.tableRow}>
      <div className={styles.idCell}>{id}</div>
      <div className={styles.contentCell}>{content}</div>
      <div className={styles.dateCell}>{date}</div>
      <div className={styles.actionCell}>
        <button className={styles.viewButton} onClick={onView}>
          <div
            dangerouslySetInnerHTML={{
              __html: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="${styles.viewIcon}">
                <path d="M10 4.16667C13.5 4.16667 16.5 6.16667 18.3333 9.16667C16.5 12.1667 13.5 14.1667 10 14.1667C6.5 14.1667 3.5 12.1667 1.66667 9.16667C3.5 6.16667 6.5 4.16667 10 4.16667ZM10 12.5C11.8417 12.5 13.3333 11.0083 13.3333 9.16667C13.3333 7.325 11.8417 5.83333 10 5.83333C8.15833 5.83333 6.66667 7.325 6.66667 9.16667C6.66667 11.0083 8.15833 12.5 10 12.5ZM10 7.5C10.9167 7.5 11.6667 8.25 11.6667 9.16667C11.6667 10.0833 10.9167 10.8333 10 10.8333C9.08333 10.8333 8.33333 10.0833 8.33333 9.16667C8.33333 8.25 9.08333 7.5 10 7.5Z" fill="#0077B6"/>
              </svg>`,
            }}
          />
        </button>
        <button className={styles.deleteButton} onClick={handleDelete}>
          <div
            dangerouslySetInnerHTML={{
              __html: `<svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="${styles.deleteIcon}"> <path d="M6.33398 17.5C5.87565 17.5 5.48329 17.3368 5.1569 17.0104C4.83051 16.684 4.66732 16.2917 4.66732 15.8333V5H3.83398V3.33333H8.00065V2.5H13.0007V3.33333H17.1673V5H16.334V15.8333C16.334 16.2917 16.1708 16.684 15.8444 17.0104C15.518 17.3368 15.1257 17.5 14.6673 17.5H6.33398ZM14.6673 5H6.33398V15.8333H14.6673V5ZM8.00065 14.1667H9.66732V6.66667H8.00065V14.1667ZM11.334 14.1667H13.0007V6.66667H11.334V14.1667Z" fill="#C01F1F"></path> </svg>`,
            }}
          />
        </button>
      </div>
    </div>
  );
}

export default PostTableRow;