import React from 'react';
import styles from './AuthLayout.module.css';

export const AuthLayout = ({ children }) => {
  return (
    <main className={styles.authContainer}>
      <section className={styles.content}>
        <article className={styles.heroContent}>
          <h2 className={styles.heroTitle}>Give Blood, Save Lives</h2>
          <p className={styles.heroDescription}>
            Every donation you make helps bring strength, hope, and healing to
            patients in need. Join our community of life-savers and make a
            lasting impact today.
          </p>
        </article>
        <div className={styles.authBox}>
          {children}
        </div>
      </section>
    </main>
  );
};