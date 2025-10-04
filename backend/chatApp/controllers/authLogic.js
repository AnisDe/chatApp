import User from "../models/user.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import {
  sendVerificationEmail,
} from "../services/emailService.js";
import {validateEmail, validatePassword} from "../utils/validators.js";
import userService from '../services/userService.js';
import crypto from "crypto";


 const register = async (req, res) => {
  const { email, username, password, adminCode } = req.body;

  // Required fields check
  if (!email || !username || !password) {
    return res.status(400).json({ message: "Missing required fields." });
  }
  // Email format validation
  if (!validateEmail(email))
    return res.status(400).json({ message: "Invalid email format." });
  // Password rules
  const passwordError = validatePassword(password);
  if (passwordError) return res.status(400).json({ message: passwordError });
  // Check for existing username or email
  const existingCheck = await userService.checkExistingUser(username, email);
  if (existingCheck && existingCheck.exists) {
    return res.status(400).json({ message: existingCheck.message });
  }

  try {
    // Create new user
    const newUser = new User({
      username,
      email,
      emailToken: crypto.randomBytes(64).toString("hex"),
      isAdmin: adminCode === "secretcode123",
    });

    const user = await User.register(newUser, password);

    // Send verification email
    const link = `http://${req.headers.host}/verify-email/${user.emailToken}`;
    await sendVerificationEmail(user, req.headers.host);

    return res
      .status(201)
      .json({
        message: "User registered successfully. Please check your email.",
      });
  } catch (err) {
    console.error(err);

    // Catch any unexpected errors
    return res.status(500).json({ message: "Internal server error." });
  }
};

// VERIFY EMAIL
 const verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ emailToken: req.params.token });

    if (!user) {
      res.redirect("http://localhost:5173/login");
      return res
        .status(400)
        .send("Invalid or expired email verification token.");
    }

    user.emailToken = null;
    user.isVerified = true;
    await user.save();

    req.login(user, (err) => {
      if (err) return next(err);
      console.log("Email verified!");
      console.log(req.user);
      res.redirect("http://localhost:5173/chat");
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal server error.");
  }
};
//resendVerification

 const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await userService.getUserByEmail(email.trim().toLowerCase());

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    // Generate new token if expired/empty
    if (!user.emailToken) {
      user.emailToken = crypto.randomBytes(64).toString("hex");
      await user.save();
    }

    const link = `http://${req.headers.host}/verify-email/${user.emailToken}`;

    await sendVerificationEmail(user, req.headers.host);

    res.json({
      message: "Verification email resent. Please check your inbox.",
    });
  } catch (err) {
    console.error("Resend verification error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// LOGIN
 const login = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: "Username or password is wrong",
      });
    }

    if (user.isVerified === false) {
      return res.status(400).json({
        message: "You have to verify your email",
        user,
      });
    }

    req.login(user, { session: false }, (err) => {
      if (err) return res.send(err);

      const token = jwt.sign(user.toJSON(), "secret code");
      return res.json({ user, token });
    });
  })(req, res);
  console.log("logged in");
};

// LOGOUT
 const logout = (req, res) => {
  req.logout(function (err) {
    res.status(200).json({ message: "Logged out successfully" });
    if (err) {
      return next(err);
    }
  });
};

 const checkAuth = async (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({ loggedIn: true, user: req.user });
  } else {
    return res.json({ loggedIn: false });
  }
};

export default { register, login, logout, verifyEmail, resendVerification, checkAuth };