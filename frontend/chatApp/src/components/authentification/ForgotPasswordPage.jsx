import React, { useState } from "react";
import { Link } from "react-router";
import axiosInstance from "../../lib/axios";
import "./forgotPasswordPage.css";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/user/forgot", { email });
      setMessage("Check your email to reset your password.");
    } catch (err) {
      setMessage("Email not found or error occurred.");
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-content">
        <h2 className="forgot-password-title">Reset Password</h2>
        <p className="forgot-password-subtitle">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="forgot-password-input"
            required
          />

          <button type="submit" className="forgot-password-btn">
            Send Reset Link
          </button>
          <p className="forgot-password-message">{message}</p>
        </form>

        <div className="forgot-password-links">
          Don't have an account?{" "}
          <Link to="/register">
            <b>Sign up for free.</b>
          </Link>
        </div>

        <div className="forgot-password-links">
          Remember your password?{" "}
          <Link to="/login">
            <b>Log in</b>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
