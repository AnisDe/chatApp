import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "./AuthContext";
import "./loginPage.css";
import axiosInstance from "../../lib/axios";
import loginImage from "../../assets/loginImage.png";

const LoginPage = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { checkAuth } = useAuth();

  useEffect(() => {
    const checkIfAlreadyLoggedIn = async () => {
      try {
        const res = await axiosInstance.get("/user/check-auth", {
          withCredentials: true,
        });
        if (res.data.loggedIn) {
          navigate("/chat");
        }
      } catch (err) {
        console.error("Auth check failed on mount:", err);
      }
    };

    checkIfAlreadyLoggedIn();
  }, [navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/user/login", form, {
        withCredentials: true,
      });

      await checkAuth(); // ✅ updates context.loggedIn state
      setMessage("Logged in successfully!");
      navigate("/chat"); // ✅ Redirect to chat page
    } catch (err) {
      setMessage("Login failed. Check credentials.");
    }
  };

  return (
    <div className="login-container">
      {/* Left section */}
      <div className="login-left">
        <h2>Welcome back!</h2>

        <form onSubmit={handleSubmit}>
          <label>
            Username <span className="required">(required)</span>
          </label>
          <input
            name="username"
            type="text"
            onChange={handleChange}
            value={form.username}
            placeholder="Username"
            required
            className="form-input"
          />

          <label>
            Password <span className="required">(required)</span>
          </label>
          <div className="password-wrapper">
            <input
              name="password"
              onChange={handleChange}
              type={showPassword ? "text" : "password"}
              value={form.password}
              required
              placeholder="Password"
              className="form-input password-input"
            />

            {form.password && (
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="show-toggle"
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            )}
          </div>

          <p className='message'>{message}</p>
          <button type="submit" className="sign-in-btn">
            Sign In
          </button>
        </form>

        <p className="extra-links">
          <Link to="/forgot">
            <b>Reset your password? </b>
          </Link>
        </p>

        <p className="extra-links">
          Don't have an account?{" "}
          <Link to="/register">
            <b>Sign up</b>
          </Link>
        </p>
      </div>

      {/* Right section */}
      <div className="login-right">
        <div className="promo">
          <img src={loginImage} alt="Login Promo" height={400} width={450} />
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. A ex</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
