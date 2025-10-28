import { useState, useCallback } from "react";
import axiosInstance from "../lib/axios";
import { useChatStore } from "../store/chatStore";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

  const { setCurrentConversation } = useChatStore();

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

      setSending(true);
      setError(null);

      let conversationId = currentConversation._id;
      let activeConversation = currentConversation;

      // 🟩 1. Create conversation if it's pending (no message yet)
      if (!conversationId || currentConversation.isPending) {
        const receiver = currentConversation.participants.find(
          (p) => p._id !== currentUserId
        );
        if (!receiver) {
          setSending(false);
          return;
        }

        try {
          const { data } = await axiosInstance.post("/messages/conversation", {
            participants: [currentUserId, receiver._id],
          });

          activeConversation = data.conversation;
          conversationId = activeConversation._id;

          // Update Zustand store
          setCurrentConversation(activeConversation);

          // ✅ Add new conversation to query cache
          queryClient.setQueryData(
            ["chatHistory", currentUserId],
            (old = []) => [activeConversation, ...old]
          );
        } catch (err) {
          console.error("Failed to create conversation:", err);
          setError("Failed to create conversation");
          setSending(false);
          return;
        }
      }

      // 🟩 2. Now send the actual message
      const receiver = activeConversation.participants.find(
        (p) => p._id !== currentUserId
      );
      if (!receiver) return;

      const tempId = `temp-${Date.now()}`;
      const optimisticMessage = {
        _id: tempId,
        conversationId,
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
          conversationId,
        });

        const sentMessage = {
          ...data.data,
          conversationId,
          status: "sent",
        };

        replaceMessage(tempId, sentMessage);
        stopTyping({ to: receiver._id, from: currentUserId });
        emit("newMessage", sentMessage);
        return sentMessage;
      } catch (err) {
        console.error("Error sending message:", err);
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
