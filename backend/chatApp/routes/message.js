import express from "express";
import messageController from '../controllers/message.js'

const router = express.Router();

router.get("/", messageController.getMessages );
router.get("/history/:userId", messageController.getChatHistory);
export default router;
