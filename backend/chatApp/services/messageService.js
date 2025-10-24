// controllers/messageHandler.js
import Conversation from "../models/conversation.js";
import Message from "../models/message.js";
import User from "../models/user.js"; // 👈 Make sure this import exists

/**
 * Handles sending a private message between two users.
 * Ensures both participants' sidebars update instantly with correct names.
 */
// controllers/messageHandler.js
export const handlePrivateMessage = async (
  io,
  socket,
  { to, message, images = [], conversationId },
  senderUser,
  messageId
) => {
  const from = senderUser._id.toString();
  const receiverUser = await User.findById(to).select("username");

  const payload = {
    _id: messageId,
    conversationId,
    sender: { _id: from, username: senderUser.username },
    receiver: { _id: to, username: receiverUser?.username || "Unknown" },
    message,
    images,
    createdAt: new Date().toISOString(),
  };

  io.to(to).emit("private_message", payload);
  io.to(from).emit("private_message", payload);
};
