import React from "react";
import styles from "./Main.module.css";
import Header from "./Header";
import Navigation from "./Navigation";
import PostCard from "./PostCard";

function Main() {
  return (
    <main className={styles.main}>
      <Header username="Syaza" />
      <div className={styles.content}>
        <Navigation
          currentPage="5 Simple Tips to Save Money as a Student"
          parentSection="Community"
        />
        <PostCard
          title="5 Simple Tips to Save Money as a Student"
          content={`Hi everyone! 🎓💰As a student, it can be tough to manage expenses, so I thought I'd share some tips that have worked for me:
          \nTrack your spending daily using apps or spreadsheets.
          \nCook meals at home instead of eating out.
          \nLook for student discounts on transportation, food, and entertainment.
          \nSet a weekly budget for non-essentials.
          \nSell old textbooks and items you no longer use.
          \nFeel free to share your own tips below! Let's help each other save! 😊`}
          replyCount={0}
        />
      </div>
    </main>
  );
}

export default Main;
