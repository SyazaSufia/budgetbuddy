import React, { useState } from "react";
import styles from "./PostTableRow.module.css";
import StatusBadge from "./StatusBadge";
import { DeleteModal } from "./DeleteModal";

function PostTableRow({ id, content, date, status, onDelete, onView }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setShowDeleteModal(false);
  };

  return (
    <div className={styles.tableRow}>
      <div className={styles.idCell}>{id}</div>
      <div className={styles.contentCell}>{content}</div>
      <div className={styles.dateCell}>{date}</div>
      <div className={styles.statusCell}>
        <StatusBadge status={status} />
      </div>
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
        <button className={styles.deleteButton} onClick={handleDeleteClick}>
          <img src="/delete-icon.svg" alt="Delete" className={styles.deleteIcon} />
        </button>
      </div>
      {showDeleteModal && (
        <DeleteModal
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          userName={`Post ${id}`}
        />
      )}
    </div>
  );
}

export default PostTableRow;