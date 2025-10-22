import Conversation from "../models/conversation.js";
/**
 * Finds or creates a conversation between two users.
 * Returns the populated conversation document.
 */
export const findOrCreateConversation = async (senderId, receiverId) => {
  if (!senderId || !receiverId) {
    throw new Error("Missing senderId or receiverId");
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  }).populate("participants", "username _id");

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
    conversation = await conversation.populate("participants", "username _id");
  }

  return conversation;
};
