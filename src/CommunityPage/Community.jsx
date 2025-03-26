import React from "react";
import styles from "./Community.module.css";
import SidebarNav from "./SideBar";
import ForumFeed from "./ForumFeed";

function Community({ user }) {
  return (
    <main className={styles.communityDefault}>
      <div className={styles.content}>
        <SidebarNav />
        <section className={styles.main}>
          <ForumFeed user={user} />
        </section>
      </div>
    </main>
  );
}

export default Community;
