import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "./components/AuthLayout";
import { Input } from "./components/Input";
import styles from "./ForgotPassword.module.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch("http://localhost:43210/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
      } else {
        setError(data.message || "Failed to send reset link. Please try again.");
      }
    } catch {
      setError("Failed to send reset link. Please try again.");
    }
  };

  return (
    <AuthLayout>
      <div className={styles.container}>
        <h2>Reset Your Password</h2>
        <p>Enter your email to receive a password reset link.</p>
        <form onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className={styles.submitButton}>Send Reset Link</button>
        </form>
        {message && <p className={styles.success}>{message}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
