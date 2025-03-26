import React from "react";
import styles from "./Main.module.css";
import ActionButton from "./ActionButton";

function PostContent({ title, content, onLike, onReply }) {
  // Format content to preserve line breaks
  const formattedContent = content.split("\n").map((line, index) => (
    <React.Fragment key={index}>
      {line}
      {index < content.split("\n").length - 1 && <br />}
    </React.Fragment>
  ));

  return (
    <section className={styles.post}>
      <h2 className={styles.simpleTipstoSaveMoneyasaStudent}>{title}</h2>
      <p className={styles.description}>{formattedContent}</p>
      <div className={styles.buttons}>
        <button
          className={styles.likeButton}
          onClick={onLike}
          aria-label="Like post"
        >
          <div className={styles.basestatus}>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/406cd8ed823cdc1c373ec589dfc5d742f419f3ff?placeholderIfAbsent=true&apiKey=0b94a44883f24936b29ca07e81963b97"
              alt="Like"
              className={styles.img2}
            />
          </div>
        </button>
        <ActionButton text="Reply" onClick={onReply} variant="primary" />
      </div>
    </section>
  );
}

export default PostContent;
