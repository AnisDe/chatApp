import User from "../models/user.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  sendResetPasswordEmail,
  sendPasswordChangedEmail
} from "../services/emailService.js";
import * as userService from "../services/userService.js";




// FORGOT PASSWORD
export const forgot = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res
        .status(200)
        .json({ message: "If the email exists, a reset link has been sent." });
    }

    // Generate token and hash it
    const token = crypto.randomBytes(20).toString("hex");
    const hashedToken = await bcrypt.hash(token, 10);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset/${token}`;

    // Send reset email
    try {
      await sendResetPasswordEmail(user, resetLink);
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);
      // Don't fail the request if email fails
    }

    res
      .status(200)
      .json({ message: "If the email exists, a reset link has been sent." });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "An error occurred while processing your request." });
  }
};

// ==========================
// VERIFY RESET TOKEN
// ==========================
export const GetResetToken = async (req, res) => {
  try {
    const token = req.params.token;
    const users = await User.find({
      resetPasswordExpires: { $gt: Date.now() },
    });

    // Find user with matching token
    const user = users.find((u) =>
      bcrypt.compareSync(token, u.resetPasswordToken),
    );
    if (!user) {
      return res
        .status(400)
        .json({ message: "Password reset token is invalid or has expired." });
    }

    res.status(200).json({ message: "Token is valid.", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ==========================
// POST NEW PASSWORD
// ==========================
export const PostResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirm } = req.body;

    if (!password || !confirm) {
      return res
        .status(400)
        .json({ message: "Password and confirmation are required." });
    }

    if (password.trim() !== confirm.trim()) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const users = await User.find({
      resetPasswordExpires: { $gt: Date.now() },
    });

    const user = users.find((u) =>
      bcrypt.compareSync(token, u.resetPasswordToken),
    );
    if (!user) {
      return res
        .status(400)
        .json({ message: "Password reset token is invalid or has expired." });
    }

    await new Promise((resolve, reject) => {
      user.setPassword(password.trim(), (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    await new Promise((resolve, reject) => {
      req.logIn(user, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // Send confirmation email
    try {
      await sendPasswordChangedEmail(user, process.env.FRONTEND_URL);
    } catch (emailErr) {
      console.error("Confirmation email failed:", emailErr);
    }
    console.log("password changed");
    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "An error occurred during password reset." });
  }
};

export default { forgot, GetResetToken, PostResetToken};