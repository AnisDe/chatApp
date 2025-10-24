import mongoose from "mongoose";
import Message from "../models/message.js";
import Conversation from "../models/conversation.js";
import User from "../models/user.js";
import cloudinary from "../utils/cloudinary.js";
import { handlePrivateMessage } from "../services/messageService.js";
import { findOrCreateConversation } from "../utils/findConv.js";

/**
 * GET /messages/:conversationId
 * Get all messages from a specific conversation.
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
 * GET /messages/history/:userId
 * Get all chat conversations for a specific user.
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
      .populate("participants", "username _id")
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
 * POST /conversations
 * Create or retrieve a conversation between two users.
 */
const createConversation = async (req, res) => {
  const { participants } = req.body;

  if (!Array.isArray(participants) || participants.length !== 2) {
    return res
      .status(400)
      .json({ error: "participants must be an array of 2 user IDs" });
  }

  const [userA, userB] = participants;

  try {
    const conversation = await findOrCreateConversation(userA, userB);
    return res.status(201).json({ conversation });
  } catch (err) {
    console.error("Error creating conversation:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * POST /messages/send
 * Send a message (creates conversation automatically if missing).
 */
// In your sendMessage controller
const sendMessage = async (req, res) => {
  const { senderId, receiverId, message = "", images = [] } = req.body;

  try {
    // 1️⃣ Ensure conversation exists
    const conversation = await findOrCreateConversation(senderId, receiverId);

    // 2️⃣ Upload images concurrently (if any)
    const uploadedImages = await Promise.all(
      images.map(async (img) => {
        const result = await cloudinary.uploader.upload(img, {
          folder: "chatApp/messages",
          resource_type: "auto",
        });
        return {
          url: result.secure_url,
          filename: result.public_id,
        };
      })
    );

    // 3️⃣ Create message
    const newMessage = await Message.create({
      conversationId: conversation._id,
      sender: senderId,
      message: message.trim(),
      images: uploadedImages,
    });

    // 4️⃣ Update conversation metadata
    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: newMessage._id,
      lastMessageAt: Date.now(),
    });

    // 5️⃣ Populate sender info for frontend
    const populatedMessage = await newMessage.populate(
      "sender",
      "username _id"
    );

    // 6️⃣ Emit socket event with ACTUAL message ID
    const io = req.app.get("io");
    if (io) {
      const senderUser = await User.findById(senderId).select("username");
      await handlePrivateMessage(
        io,
        null,
        {
          to: receiverId,
          message,
          images: uploadedImages,
          conversationId: conversation._id,
        },
        senderUser,
        populatedMessage._id // ✅ Pass the actual message ID
      );

      io.to(receiverId).emit("notification", {
        from: senderId,
        fromUsername: senderUser.username,
        messagePreview:
          populatedMessage.message?.slice(0, 50) ||
          (uploadedImages.length > 0 ? "[Image]" : "[New message]"),
        conversationId: conversation._id,
      });
    }

    // 7️⃣ Respond to client with actual message data
    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      conversationId: conversation._id,
      data: populatedMessage,
    });
  } catch (err) {
    console.error("Error sending message:", err);
    res
      .status(500)
      .json({ error: "Failed to send message", details: err.message });
  }
};
/**
 * DELETE /messages/conversation/:conversationId
 * Delete a conversation and all its messages.
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
  createConversation,
  sendMessage,
  deleteConversation,
};
