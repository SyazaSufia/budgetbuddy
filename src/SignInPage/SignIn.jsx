import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "./components/AuthLayout";
import { Link, useLocation } from "react-router-dom";
import { Input } from "./components/Input";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { authAPI } from "../services/UserApi";
import styles from "./SignIn.module.css";

const SignIn = ({ onSignIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const validateForm = () => {
    const errors = {};

    // Email validation
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password.trim()) {
      errors.password = 'Password is required';
    }

    return errors;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setError(Object.values(formErrors)[0]);
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      
      // Use the centralized API for sign in
      const data = await authAPI.signIn({ email, password });
      
      console.log("Sign-in response:", data);

      if (data.success) {
        onSignIn(data.user);
        const { role, id } = data.user;
        console.log("User ID:", id);

        if (role === "user") {
          navigate("/", { state: { userID: id } });
        } else if (role === "admin") {
          navigate("/adminStats");
        }
      } else {
        setError(data.message || "Sign in failed");
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  return (
    <AuthLayout>
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.welcome}>
            Welcome to <span className={styles.brandText}>BudgetBuddy</span>
          </h2>
          <nav className={styles.authNav}>
            <Link to="/sign-in" className={styles.navLink}>
              <button
                className={`${styles.activeButton} ${
                  location.pathname === "/sign-in" ? styles.active : ""
                }`}
              >
                Sign In
              </button>
            </Link>
            <Link to="/sign-up" className={styles.navLink}>
              <button
                className={`${styles.inactiveButton} ${
                  location.pathname === "/sign-up" ? styles.active : ""
                }`}
              >
                Sign Up
              </button>
            </Link>
          </nav>
        </header>

        <form className={styles.form} onSubmit={handleSignIn}>
          <Input
            label="Enter your email address"
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <div className={styles.passwordContainer}>
            <Input
              label="Enter your password"
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              icon={
                <span
                  className={styles.eyeIcon}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              }
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}

          {/* Forgot Password Link */}
          <div className={styles.forgotPasswordContainer}>
            <Link to="/forgot-password" className={styles.forgotPasswordLink}>
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className={`${styles.submitButton} ${
              isFormValid && !isLoading ? styles.enabled : styles.disabled
            }`}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignIn;