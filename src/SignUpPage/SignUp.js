import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import { AuthLayout } from './components/AuthLayout';
import { Input } from './components/Input';
import styles from './SignUp.module.css';

const SignUp = ({ onSignUp }) => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Define successMessage state
  const navigate = useNavigate();
  const location = useLocation();
  const validateInputs = () => {
    if (!name || !email || !dob || !password || !confirmPassword) {
      setError("All fields are required.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };
  
  const handleSignUp = async (e) => {
    e.preventDefault();
  
    if (!validateInputs()) return;
  
    try {
      const response = await fetch("http://localhost:8081/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donorName: name, donorEmail: email, donorPassword: password, donorDOB: dob }),
      });
  
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Failed to sign up.");
        return;
      }
  
      setSuccessMessage(data.message);
      navigate("/sign-in");
    } catch (err) {
      console.error("Error during sign-up:", err);
      setError("Something went wrong. Please try again.");
    }
  };  

  const isFormValid =
    name.trim() !== '' &&
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
            label="Enter your full name"
            placeholder="Full name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
          {successMessage && <p className={styles.success}>{successMessage}</p>}
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
