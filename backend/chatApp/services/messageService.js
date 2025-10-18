// controllers/messageHandler.js
import Conversation from "../models/conversation.js";
import Message from "../models/message.js";
import User from "../models/user.js"; // 👈 Make sure this import exists

/**
 * Handles sending a private message between two users.
 * Ensures both participants' sidebars update instantly with correct names.
 */
export const handlePrivateMessage = async (
  io,
  socket,
  { to, message },
  senderUser,
) => {
  if (!to || !message || !senderUser?._id) {
    console.error("❌ Invalid message payload");
    return;
  }

  const from = senderUser._id.toString();
  let conversation = await Conversation.findOne({
    participants: { $all: [from, to] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [from, to],
    });
  }

  const receiverUser = await User.findById(to).select("username");

  const newMessage = await Message.create({
    conversationId: conversation._id,
    sender: from,
    message,
  });

  conversation.lastMessage = newMessage._id;
  conversation.lastMessageAt = new Date();
  await conversation.save();
  const payload = {
    conversationId: conversation._id,
    sender: { _id: from, username: senderUser.username },
    receiver: {
      _id: to,
      username: receiverUser?.username || "Unknown",
    },
    message,
    timestamp: conversation.lastMessageAt,
  };

  io.to(to).emit("private_message", payload);

  io.to(from).emit("private_message", payload);

  io.to(to).emit("notification", {
    conversationId: conversation._id,
    from,
    fromUsername: senderUser.username,
    messagePreview: message.substring(0, 80),
  });
};
