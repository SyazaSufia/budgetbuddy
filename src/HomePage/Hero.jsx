import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Hero.module.css';
import Button from './Button';

const Hero = ({user}) => {

  const navigate = useNavigate();
  const handleGetStarted = () => {
    if (user?.role === 'user') {
      navigate('/profile'); // Redirect to sign-in page if not signed in
    } else {
      navigate('/sign-in'); // Proceed to booking if signed in
    }
  };

  return (
    <header className={styles.hero}>
      <div className={styles.contentContainer}>
        <div className={styles.textContent}>
          <h1 className={styles.mainHeading}>
            Master Your Money, Simplify Student Life!
          </h1>
          <p className={styles.subHeading}>
            BudgetBuddy helps you track your spending, monitor your income, 
            and visualize your financial habits, so you can make every Ringgit count.
          </p>
        <div className={styles.actionArea}>
          <Button text="Get Started" variant="cta" onClick={handleGetStarted} />
        </div>
      </div>
      <img
           src="/Home-Header.svg"
           alt="Budget management illustration"
           className={styles.heroImage}
           loading="lazy"
         />
      </div>
    </header>
  );
};

export default Hero;