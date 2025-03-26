import React from "react";
import styles from "./PostTable.module.css";
import PostTableRow from "./PostTableRow";

function PostTable() {
  const posts = [
    {
      id: "post0001",
      content: "content preview (first 50-100 characters)",
      date: "11-07-2023",
      status: "Pending",
    },
    {
      id: "post0002",
      content: "content preview (first 50-100 characters)",
      date: "11-07-2023",
      status: "Reviewed",
    },
    {
      id: "post0003",
      content: "content preview (first 50-100 characters)",
      date: "11-07-2023",
      status: "Violated",
    },
    {
      id: "post0004",
      content: "content preview (first 50-100 characters)",
      date: "11-07-2023",
      status: "Pending",
    },
    {
      id: "post0005",
      content: "content preview (first 50-100 characters)",
      date: "11-07-2023",
      status: "Pending",
    },
    {
      id: "post0006",
      content: "content preview (first 50-100 characters)",
      date: "11-07-2023",
      status: "Pending",
    },
  ];

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableContent}>
        <div className={styles.tableHeader}>
          <div className={styles.idHeader}>Post ID</div>
          <div className={styles.contentHeader}>Content</div>
          <div className={styles.dateHeader}>Post Date</div>
          <div className={styles.statusHeader}>Status</div>
          <div className={styles.actionHeader}>Action</div>
        </div>

        {posts.map((post, index) => (
          <PostTableRow
            key={post.id}
            id={post.id}
            content={post.content}
            date={post.date}
            status={post.status}
          />
        ))}
      </div>
    </div>
  );
}

export default PostTable;
