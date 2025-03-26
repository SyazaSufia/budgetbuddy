import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ForumFeed.module.css";
import PostCard from "./PostCard";
import AddPostPage from "./AddPostPage/InputDesign";

function ForumFeed({ user }) {
  const navigate = useNavigate();

  const handleAddPost = () => {
    navigate("/addpost");
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <section className={styles.feedContainer}>
        <header className={styles.feedHeader}>
          <h1 className={styles.greeting}>Hello, {user?.name || "Guest"}!</h1>
        </header>
        <div className={styles.feedContent}>
          <div className={styles.postRow}>
            <PostCard
              title="5 Simple Tips to Save Money as a Student"
              description="Hi everyone! 🎓💰 As a student, it can be tough to manage expenses, so I thought I'd share some tips that have worked for me:"
              commentCount="64"
              date="15-11-2024"
            />
            <PostCard
              title="How I handle Unexpected Expenses"
              description="Hey folks! 🚨 Unexpected expenses can be stressful, but I've learned a few ways to handle them better: Keep an emergency fund."
              commentCount="64"
              date="15-11-2024"
            />
            <PostCard
              title="Small Steps, Big Changes!"
              description="Hello everyone! 🌟 Just a little reminder that every RM1 you save today is a step toward your financial freedom tomorrow. Start small, stay consistent, and you'll see the results!"
              commentCount="64"
              date="15-11-2024"
            />
          </div>
          <div className={styles.postRow}>
            <PostCard
              title="Join the RM10 Meal Challenge!"
              description="Hi Budgeters! 🍽️ I thought it'd be fun to do a challenge: Make a meal for RM10 or less and share your recipe here!"
              commentCount="64"
              date="15-11-2024"
            />
            <PostCard
              title="I saved RM500 in 3 months - Here's how!"
              description="Hey everyone! 🎉 I wanted to share my small win with you all. I managed to save RM500 in just three months! Here's what I did:"
              commentCount="64"
              date="15-11-2024"
            />
            <PostCard
              title="Title"
              description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
              commentCount="64"
              date="15-11-2024"
            />
          </div>
          <div className={styles.actionContainer}>
            <button className={styles.addButton} onClick={handleAddPost}>
              <img
                src="/add-icon.svg"
                alt="Add Icon"
                className={styles.addIcon}
              />
              Add New Post
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default ForumFeed;
