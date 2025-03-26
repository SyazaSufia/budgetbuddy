import React, { useState } from "react";
import styles from "./Main.module.css";
import PostContent from "./PostContent";
import ReplySection from "./ReplySection";

function PostCard({ title, content, replyCount = 0 }) {
  const [likeCount, setLikeCount] = useState(0);
  const [showReplyEditor, setShowReplyEditor] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleLike = () => {
    setLikeCount((prev) => prev + 1);
  };

  const handleReply = () => {
    setShowReplyEditor(true);
  };

  const handleCancel = () => {
    setReplyText("");
    setShowReplyEditor(false);
  };

  const handleSubmitReply = () => {
    // In a real app, this would submit the reply to a backend
    console.log("Reply submitted:", replyText);
    setReplyText("");
    setShowReplyEditor(false);
  };

  return (
    <article className={styles.postCard}>
      <PostContent
        title={title}
        content={content}
        onLike={handleLike}
        onReply={handleReply}
      />
      <ReplySection
        replyCount={replyCount}
        onCancel={handleCancel}
        onSubmit={handleSubmitReply}
        replyText={replyText}
        setReplyText={setReplyText}
      />
    </article>
  );
}

export default PostCard;
