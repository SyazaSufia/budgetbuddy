import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "./components/AuthLayout";
import { Link, useLocation } from "react-router-dom";
import { Input } from "./components/Input";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "./SignIn.module.css";

const SignIn = ({ onSignIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://budgetbuddy.space/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });      

      const data = await response.json();
      console.log("Parsed data:", data);

      if (data.success) {
        onSignIn(data.user);
        const { role, id } = data.user;
        console.log("User ID:", id);

        if (role === "user") {
          navigate("/", { state: { userID: id } });
        } else if (role === "admin") {
          navigate("/admin-home");
        }
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      setError("Something went wrong. Please try again.");
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
          />
          <div className={styles.passwordContainer}>
            <Input
              label="Enter your password"
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              isFormValid ? styles.enabled : styles.disabled
            }`}
            disabled={!isFormValid}
          >
            Sign In
          </button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignIn;
