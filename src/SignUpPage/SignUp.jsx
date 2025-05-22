import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AuthLayout } from "./components/AuthLayout";
import { Input } from "./components/Input";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { authAPI } from "../services/api"; // Import your centralized API
import styles from "./SignUp.module.css";

const SignUp = ({ onSignUp }) => {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add loading state
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

  // Check if the form is valid for enabling/disabling the submit button
  const isFormValid = name && email && dob && password && 
                     confirmPassword && password === confirmPassword;

  // Updated HandleSignUp function using your centralized API
  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!validateInputs()) return;

    setIsLoading(true); // Set loading state
    setError(""); // Clear previous errors
    setSuccessMessage(""); // Clear previous success messages

    try {
      const userData = {
        userName: name,
        userEmail: email,
        userPassword: password,
        userDOB: dob,
      };

      // Use your centralized authAPI instead of direct fetch
      const data = await authAPI.signUp(userData);

      setSuccessMessage(data.message || "Sign up successful!");
      
      // Optional: Call the onSignUp prop if provided
      if (onSignUp) {
        onSignUp(data);
      }

      // Navigate to sign-in page after successful signup
      setTimeout(() => {
        navigate("/sign-in");
      }, 1500); // Small delay to show success message

    } catch (err) {
      console.error("Error during sign-up:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

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
                className={`${styles.inactiveButton} ${
                  location.pathname === "/sign-in" ? styles.active : ""
                }`}
              >
                Sign In
              </button>
            </Link>
            <Link to="/sign-up" className={styles.navLink}>
              <button
                className={`${styles.activeButton} ${
                  location.pathname === "/sign-up" ? styles.active : ""
                }`}
              >
                Sign Up
              </button>
            </Link>
          </nav>
        </header>

        <form className={styles.form} onSubmit={handleSignUp}>
          <Input
            label="Enter name"
            placeholder="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading} // Disable during loading
          />
          <Input
            label="Enter your email address"
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <Input
            label="Enter your date of birth"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            disabled={isLoading}
          />
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
          <Input
            label="Confirm password"
            placeholder="Confirm password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            icon={
              <span
                className={styles.eyeIcon}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            }
          />
          
          {successMessage && <p className={styles.success}>{successMessage}</p>}
          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={`${styles.submitButton} ${
              isFormValid && !isLoading ? styles.enabled : styles.disabled
            }`}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignUp;