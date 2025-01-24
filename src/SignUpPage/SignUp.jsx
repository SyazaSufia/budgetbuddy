import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import { AuthLayout } from './components/AuthLayout';
import { Input } from './components/Input';
import styles from './SignUp.module.css';

const SignUp = ({ onSignUp }) => {
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const formatDateToDDMMYYYY = (date) => {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleSignUp = (e) => {
    e.preventDefault();
  
    const formattedDob = formatDateToDDMMYYYY(dob); // Convert to DD/MM/YYYY
  
    if (email === 'user@email.com' && formattedDob === '23/11/2024' && password === 'user123') {
      const userData = {email, dob: formattedDob, role: 'user' }; // Use formattedDob here if needed
      onSignUp(userData);
      navigate('/');
    } 
    
    else {
      setError('Invalid signup details');
    }
  };

  const isFormValid =
    email.trim() !== '' &&
    dob.trim() !== '' &&
    password.trim() !== '' &&
    confirmPassword.trim() !== '';

  return (
    <AuthLayout>
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.welcome}>
            Welcome to <span className={styles.brandText}>BloodConnect</span>
          </h2>
          <nav className={styles.authNav}>
            <Link to="/sign-in" className={styles.navLink}>
              <button className={`${styles.inactiveButton} ${location.pathname === '/sign-in' ? styles.active : ''}`}>
                Sign In
              </button>
            </Link>
            <Link to="/sign-up" className={styles.navLink}>
              <button className={`${styles.activeButton} ${location.pathname === '/sign-up' ? styles.active : ''}`}>
                Sign Up
              </button>
            </Link>
          </nav>
        </header>

        <form className={styles.form} onSubmit={handleSignUp}>
          <Input
            label="Enter your email address"
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Enter your date of birth"
            placeholder="DD/MM/YYYY"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
          <Input
            label="Enter your password"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            label="Confirm password"
            placeholder="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button
            type="submit"
            className={`${styles.submitButton} ${isFormValid ? styles.enabled : styles.disabled}`}
            disabled={!isFormValid}
          >
            Sign Up
          </button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
