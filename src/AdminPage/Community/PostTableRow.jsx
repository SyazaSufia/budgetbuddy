import React from "react";
import styles from "./PostTableRow.module.css";
import StatusBadge from "./StatusBadge";

function PostTableRow({ id, content, date, status }) {
  const handleDelete = () => {
    // Handle delete functionality
    console.log(`Deleting post: ${id}`);
  };

  return (
    <div className={styles.tableRow}>
      <div className={styles.idCell}>{id}</div>
      <div className={styles.contentCell}>{content}</div>
      <div className={styles.dateCell}>{date}</div>
      <div className={styles.statusCell}>
        <div className={styles.statusWrapper}>
          <StatusBadge status={status} />
        </div>
      </div>
      <div className={styles.actionCell}>
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
