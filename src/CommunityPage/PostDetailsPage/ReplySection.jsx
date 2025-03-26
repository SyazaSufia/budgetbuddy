import React from "react";
import styles from "./Main.module.css";
import RichTextEditor from "./RichTextEditor";
import ActionButton from "./ActionButton";

function ReplySection({
  replyCount,
  onCancel,
  onSubmit,
  replyText,
  setReplyText,
}) {
  const isReplyEmpty = !replyText.trim();

  return (
    <section className={styles.reply}>
      <div className={styles.replyTitle}>
        <h3 className={styles.reply2}>Reply</h3>
        <div className={styles.count}>
          <span>({replyCount})</span>
        </div>
      </div>
      <div className={styles.reply3}>
        <RichTextEditor
          value={replyText}
          onChange={setReplyText}
          placeholder="Add a message here"
        />
        <div className={styles.buttons}>
          <ActionButton text="Cancel" onClick={onCancel} variant="primary" />
          <ActionButton
            text="Reply"
            onClick={onSubmit}
            disabled={isReplyEmpty}
          />
        </div>
      </div>
    </section>
  );
}

export default ReplySection;
