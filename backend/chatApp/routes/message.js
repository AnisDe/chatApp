import express from "express";
import messages from "../controllers/message.js";

const router = express.Router();

// Chat history (list of conversations)
router.get("/history/:userId", messages.getChatHistory);

// Messages inside a conversation
router.get("/:conversationId", messages.getMessages);

// Send message (auto create/find conversation)
router.post("/send", messages.sendMessage);

// Delete a conversation
router.delete("/conversation/:conversationId", messages.deleteConversation);

export default router;
