import express from "express";
import passport from "passport";
import users from "../controllers/users.js";
import passwordLogic from "../controllers/passwordLogic.js";
import authLogic from "../controllers/authLogic.js";
// import { arcjetProtection } from '../middleware/arcjet.middleware.js';

const router = express.Router();

// router.use(arcjetProtection);

router.post("/register", authLogic.register);

router.post("/login", passport.authenticate("local"), authLogic.login);

router.delete("/logout", authLogic.logout);

router.post("/forgot", passwordLogic.forgot);

router.post("/resend-verification", authLogic.resendVerification);

router.post("/reset/:token", passwordLogic.PostResetToken);

router.put("/edit/me", users.editUser);

router.get("/verify-email/:token", authLogic.verifyEmail);

router.get("/profile/me", users.profile);

router.get("/check-auth/", authLogic.checkAuth);

router.get("/search", users.searchUser);

router.get("/password/reset/:token", passwordLogic.GetResetToken);

router.delete("/delete/:id", users.DeleteUser);

export default router;
