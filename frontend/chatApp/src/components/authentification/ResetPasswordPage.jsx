import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import axiosInstance from '../../lib/axios';
import "./loginPage.css"; // reuse your existing CSS

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setMessage("Passwords do not match.");
      return;
    }
    try {
      await axiosInstance.post(`/user/reset/${token}`, form);
      setMessage('Password reset successful.');
      navigate('/login'); 
    } catch (err) {
      setMessage('Error resetting password or invalid token.');
    }
  };

  // Helper to check password rules
  const passwordRules = [
    { rule: form.password.length >= 8, text: "At least 8 characters" },
    { rule: /[A-Z]/.test(form.password), text: "One uppercase letter" },
    { rule: /[a-z]/.test(form.password), text: "One lowercase letter" },
    { rule: /\d/.test(form.password), text: "One number" },
    { rule: /[!@#$%^&*(),.?":{}|<>]/.test(form.password), text: "One special character" },
  ];

  const allRulesValid = passwordRules.every(r => r.rule);

  return (
    <div className="login-container">
      <div className="login-left">
        <h2>Reset Password</h2>

        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className="password-wrapper">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="New Password"
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

            {/* Dynamic password popup, disappears when all rules valid */}
            {form.password && !allRulesValid && (
              <div className="password-popup">
                <ul>
                  {passwordRules.map((r, i) => (
                    <li key={i} className={r.rule ? "valid" : "invalid"}>
                      {r.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <input
            name="confirm"
            type="password"
            value={form.confirm}
            onChange={handleChange}
            placeholder="Confirm Password"
            required
          />

          <button type="submit">Reset Password</button>
          {message && <p className='message'>{message}</p>}
        </form>

        <div className="extra-links">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>

      <div className="login-right">
        <div className="promo">
          <h2>Secure Your Account</h2>
          <p>
            Enter a strong new password that meets all security requirements. Once all requirements are satisfied, the password will be accepted.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
