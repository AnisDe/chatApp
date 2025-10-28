import { useState, useCallback } from "react";
import axiosInstance from "../lib/axios";

export const useMessageSender = ({
  currentUserId,
  currentConversation,
  emit,
  addMessage,
  replaceMessage,
  startTyping,
  stopTyping,
}) => {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // ✅ use startTyping instead of direct emit
  const handleTyping = useCallback(() => {
    if (!currentConversation || !currentUserId) return;

    const receiver = currentConversation.participants.find(
      (p) => p._id !== currentUserId
    );
    if (!receiver) return;

    startTyping({ to: receiver._id, from: currentUserId });
  }, [currentConversation, currentUserId, startTyping]);

  const handleSend = useCallback(
    async (text, images = []) => {
      if ((!text?.trim() && images.length === 0) || !currentConversation)
        return;
      if (!currentUserId) return;

      const receiver = currentConversation.participants.find(
        (p) => p._id !== currentUserId
      );
      if (!receiver) return;

      setSending(true);
      setError(null);

      const tempId = `temp-${Date.now()}`;
      const optimisticMessage = {
        _id: tempId,
        conversationId: currentConversation._id,
        sender: { _id: currentUserId },
        receiver: { _id: receiver._id },
        message: text.trim(),
        images,
        createdAt: new Date().toISOString(),
        status: "sending",
        isTemp: true,
      };

      addMessage(optimisticMessage);

      try {
        const { data } = await axiosInstance.post("/messages/send", {
          senderId: currentUserId,
          receiverId: receiver._id,
          message: text.trim(),
          images,
          conversationId: currentConversation._id,
        });

        const sentMessage = {
          ...data.data,
          conversationId: currentConversation._id,
          status: "sent",
        };

        replaceMessage(tempId, sentMessage);

        // ✅ stop typing explicitly once message sent
        stopTyping({ to: receiver._id, from: currentUserId });

        emit("newMessage", sentMessage);
        return sentMessage;
      } catch (err) {
        console.error("❌ Error sending message:", err);
        setError(err.response?.data?.message || "Failed to send message");
        replaceMessage(tempId, { ...optimisticMessage, status: "failed" });
      } finally {
        setSending(false);
      }
    },
    [
      currentUserId,
      currentConversation,
      emit,
      addMessage,
      replaceMessage,
      stopTyping,
    ]
  );

  return {
    handleSend,
    handleTyping,
    sending,
    error,
    clearError: () => setError(null),
  };
};
