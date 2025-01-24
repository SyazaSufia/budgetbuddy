import React from 'react';
import styles from './AuthLayout.module.css';

export const AuthLayout = ({ children }) => {
  return (
    <main className={styles.authContainer}>
      <section className={styles.content}>
        <article className={styles.heroContent}>
          <img
            src="/SignIn.svg"
            alt="Sign In Illustration"
            className={styles.heroImage}
          />
        </article>
        <div className={styles.authBox}>{children}</div>
      </section>
    </main>
  );
};