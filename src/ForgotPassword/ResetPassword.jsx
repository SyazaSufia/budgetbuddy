import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthLayout } from "./components/AuthLayout";
import { Input } from "./components/Input";
import styles from "./ResetPassword.module.css";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://localhost:43210/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setTimeout(() => navigate("/sign-in"), 3000);
      } else {
        setError(data.message || "Failed to reset password. Please try again.");
      }
    } catch {
      setError("Failed to reset password. Please try again.");
    }
  };

  return (
    <AuthLayout>
      <div className={styles.container}>
        <h2>Set New Password</h2>
        <form onSubmit={handleSubmit}>
          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button type="submit" className={styles.submitButton}>Reset Password</button>
        </form>
        {message && <p className={styles.success}>{message}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
