// controllers/messages.js
import mongoose from "mongoose";
import Message from "../models/message.js";
import Conversation from "../models/conversation.js";

/**
 * Get all messages from a specific conversation
 * GET /messages/:conversationId
 */
const getMessages = async (req, res) => {
  const { conversationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(400).json({ error: "Invalid conversation ID" });
  }

  try {
    const messages = await Message.find({ conversationId })
      .populate("sender", "username _id")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get all conversations for a user (Chat history list)
 * GET /messages/history/:userId
 */
const getChatHistory = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate({
        path: "participants",
        select: "username _id",
      })
      .populate({
        path: "lastMessage",
        select: "message sender createdAt",
        populate: { path: "sender", select: "username _id" },
      })
      .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (err) {
    console.error("Error fetching chat history:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Send a new message (find or create conversation automatically)
 * POST /messages/send
 */
const sendMessage = async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  if (!senderId || !receiverId || !message) {
    return res
      .status(400)
      .json({ error: "Missing sender, receiver, or message" });
  }

  try {
    // 1️⃣ Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    // 2️⃣ Create message
    const newMessage = await Message.create({
      conversationId: conversation._id,
      sender: senderId,
      message,
    });

    // 3️⃣ Update conversation metadata
    conversation.lastMessage = newMessage._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // 4️⃣ Return the new message
    const populated = await newMessage.populate("sender", "username _id");

    res.status(201).json({
      message: "Message sent successfully",
      conversationId: conversation._id,
      data: populated,
    });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Delete a conversation (and its messages)
 * DELETE /messages/conversation/:conversationId
 */
const deleteConversation = async (req, res) => {
  const { conversationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(400).json({ error: "Invalid conversation ID" });
  }

  try {
    await Message.deleteMany({ conversationId });
    await Conversation.findByIdAndDelete(conversationId);

    res.json({ message: "Conversation deleted successfully" });
  } catch (err) {
    console.error("Error deleting conversation:", err);
    res.status(500).json({ error: err.message });
  }
};

export default {
  getMessages,
  getChatHistory,
  sendMessage,
  deleteConversation,
};
