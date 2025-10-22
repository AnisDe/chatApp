// hooks/useMessageSender.js
import { useState, useCallback } from "react";
import axiosInstance from "../lib/axios";

export const useMessageSender = ({
  currentUserId,
  currentConversation,
  emit,
  addMessage,
  stopTyping,
}) => {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = useCallback(
    async (text, images = []) => {
      if ((!text?.trim() && images.length === 0) || !currentConversation) return;
      if (!currentUserId) return;

      const receiver = currentConversation.participants.find(
        (p) => p._id !== currentUserId
      );
      if (!receiver) return;

      setSending(true);
      setError(null);

      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        conversationId: currentConversation._id,
        sender: { _id: currentUserId },
        receiver: { _id: receiver._id },
        message: text.trim(),
        images,
        createdAt: new Date().toISOString(),
        status: "sending",
      };
      addMessage(optimisticMessage);

      try {
        const response = await axiosInstance.post("/messages/send", {
          senderId: currentUserId,
          receiverId: receiver._id,
          message: text.trim(),
          images,
          conversationId: currentConversation._id,
        });

        const sentMessage = {
          ...response.data.data,
          conversationId: currentConversation._id,
        };

        // Emit socket only (avoid duplicate optimistic insert)
      

        stopTyping({ to: receiver._id, from: currentUserId });
        return sentMessage;
      } catch (err) {
        console.error("Error sending message:", err);
        setError(err.response?.data?.message || "Failed to send message");
        addMessage({ ...optimisticMessage, status: "failed" });
      } finally {
        setSending(false);
      }
    },
    [currentUserId, currentConversation, emit, addMessage, stopTyping]
  );

  const handleTyping = useCallback(() => {
    if (!currentConversation || !currentUserId) return;
    const receiver = currentConversation.participants.find(
      (p) => p._id !== currentUserId
    );
    if (receiver) emit("typing", { to: receiver._id, from: currentUserId });
  }, [currentConversation, currentUserId, emit]);

  return { handleSend, handleTyping, sending, error, clearError: () => setError(null) };
};
