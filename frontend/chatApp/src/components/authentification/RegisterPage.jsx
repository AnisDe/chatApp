import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import "./loginPage.css";
import { useAuth } from "./AuthContext";
import axiosInstance from "../../lib/axios";
import { validatePassword } from "../../utils/validation";

const RegisterPage = () => {
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",

  });
  const [message, setMessage] = useState("");
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [resendMessage, setResendMessage] = useState("");
  const { loggedIn, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && loggedIn) {
      navigate("/forgot");
    }
  }, [loggedIn, loading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prevForm) => ({ ...prevForm, [name]: value }));

    if (name === "password") {
      const errors = validatePassword(value);
      setPasswordErrors(errors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordErrors.length > 0) {
      setMessage("Fix password errors before submitting.");
      return;
    }

    try {
      const res = await axiosInstance.post("/user/register", form);
      setMessage(res.data.message); // ✅ use backend message
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed.");
    }
  };

  // 📧 Resend verification
  const handleResend = async () => {
    if (!form.email) {
      setResendMessage("Please enter your email first.");
      return;
    }
    try {
      const res = await axiosInstance.post("/user/resend-verification", {
        email: form.email,
      });
      setResendMessage(res.data.message);
    } catch (err) {
      setResendMessage(
        err.response?.data?.message || "Error resending verification email.",
      );
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <h2>Register</h2>

        <form onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            onChange={handleChange}
            placeholder="Email"
            required
          />
          <input
            name="username"
            type="text"
            onChange={handleChange}
            placeholder="Username"
            required
          />

          <div className="password-wrapper">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="password-input"
              required
            />

            {form.password && (
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="show-toggle"
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            )}

            {/* Only show popup if at least one rule is invalid */}
            {form.password &&
              !(
                form.password.length >= 8 &&
                /[A-Z]/.test(form.password) &&
                /[a-z]/.test(form.password) &&
                /\d/.test(form.password) &&
                /[!@#$%^&*(),.?":{}|<>]/.test(form.password)
              ) && (
                <div className="password-popup">
                  <ul>
                    <li
                      className={
                        form.password.length >= 8 ? "valid" : "invalid"
                      }
                    >
                      At least 8 characters
                    </li>
                    <li
                      className={
                        /[A-Z]/.test(form.password) ? "valid" : "invalid"
                      }
                    >
                      One uppercase letter
                    </li>
                    <li
                      className={
                        /[a-z]/.test(form.password) ? "valid" : "invalid"
                      }
                    >
                      One lowercase letter
                    </li>
                    <li
                      className={/\d/.test(form.password) ? "valid" : "invalid"}
                    >
                      One number
                    </li>
                    <li
                      className={
                        /[!@#$%^&*(),.?":{}|<>]/.test(form.password)
                          ? "valid"
                          : "invalid"
                      }
                    >
                      One special character
                    </li>
                  </ul>
                </div>
              )}
          </div>

      
          <button type="submit">Register</button>
          <p className='message'>{message}</p>
        </form>

        {message.includes(
          "User registered successfully. Please check your email.",
        ) && (
          <div className="resend-section">
            <p>Didn’t get the email?</p>
            <button type="button" onClick={handleResend}>
              Resend Verification Email
            </button>
            {resendMessage && <p className='message'> {resendMessage}</p>}
          </div>
        )}

        <p className="extra-links">
          Have an account?{" "}
          <Link to="/login">
            <b>Log in</b>
          </Link>
        </p>
      </div>

      <div className="login-right">
        <div className="promo">
          <h2>Welcome</h2>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur
            veniam voluptatem magni, obcaecati aperiam mollitia quisquam
            distinctio explicabo itaque cumque excepturi nesciunt doloremque
            unde consequuntur omnis cum provident. Animi, cupiditate.
          </p>
          <button className="learn-btn">Learn More ›</button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
