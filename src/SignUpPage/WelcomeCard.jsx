import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './WelcomeCard.module.css';
import InputField from './InputField';

const WelcomeCard = () => {
  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Check if all fields have content and passwords match
  const isFormValid =
    email.trim() !== '' &&
    password.trim() !== '' &&
    confirmPassword.trim() !== '' && password === confirmPassword;

  return (
    <section className={styles.welcomeCard}>
      <div className={styles.cardHeader}>
        <div className={styles.titleWrapper}>
          <p className={styles.welcomeText}>
            <span>Welcome to </span>
            <span className={styles.brandName}>BudgetBuddy.</span>
          </p>
          <h2 className={styles.signInTitle}>Sign up</h2>
        </div>
        <div className={styles.signUpPrompt}>
          <p className={styles.noAccountText}>Have an account?</p>
          <Link to="/sign-in" className={styles.signUpLink}>Sign in</Link>
        </div>
      </div>
      <form className={styles.signInForm}>
        <InputField
          label="Enter your email address"
          type="text"
          id="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputField
          type="text"
          id="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <InputField
          label="Enter your password"
          type="password"
          id="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <InputField
          label="Confirm password"
          type="password"
          id="confirmPassword"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
          type="submit"
          className={styles.signInButton}
          style={{
            backgroundColor: isFormValid ? '#4B7D8C' : '#ccc',
            color: isFormValid ? '#fff' : '#9E9E9E',
            cursor: isFormValid ? 'pointer' : 'not-allowed',
          }}
        >
          Sign up
        </button>
      </form>
    </section>
  );
};

export default WelcomeCard;
