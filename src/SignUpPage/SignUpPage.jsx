import React from 'react';
import styles from './SignUpPage.module.css';
import WelcomeCard from './WelcomeCard';

const SignUpPage = () => {
  return (
    <main className={styles.signUpPage}>
      <div className={styles.content}>
        <section className={styles.heroSection}>
          <h2 className={styles.heroTitle}>Give Blood Save Lives</h2>
          <p className={styles.heroDescription}>
            Every donation you make helps bring strength, hope, and healing to patients in need. Join our community of life-savers and make a lasting impact today
          </p>
        </section>
        <WelcomeCard />
      </div>
    </main>
  );
};

export default SignUpPage;