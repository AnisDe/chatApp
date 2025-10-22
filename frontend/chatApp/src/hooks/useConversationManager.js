// hooks/useConversationManager.js
import { useCallback } from "react";
import { useChatStore } from "../store/chatStore";
import { useChatHistory } from "./useChatHistory";
import { useMessages } from "./useMessages";
import axiosInstance from "../lib/axios";

export const useConversationManager = (currentUserId) => {
  const { currentConversation, setCurrentConversation } = useChatStore();
  const {
    chatHistory,
    setChatHistory,
    handleReceivedMessage,
    refetch: refetchChatHistory,
  } = useChatHistory(currentUserId);

  const { messages, setMessages, addMessage, clearMessages } =
    useMessages(currentConversation);

  const handleSelectConversation = useCallback(
    async (conversationOrUser) => {
      if (!currentUserId) {
        throw new Error("User must be logged in to select conversation");
      }

      try {
        // 🟩 Case 1: Existing conversation (from chat history)
        if (Array.isArray(conversationOrUser.participants)) {
          setCurrentConversation(conversationOrUser);
          return;
        }

        // 🟩 Case 2: New user from search - find or create conversation
        const targetUserId = conversationOrUser._id;
        if (!targetUserId) {
          throw new Error("Invalid user selected (missing _id)");
        }

        // Safely check if a conversation already exists
        const existingConversation = chatHistory.find((conv) =>
          conv.participants?.some((p) => p._id === targetUserId)
        );

        if (existingConversation) {
          setCurrentConversation(existingConversation);
        } else {
          // Create new conversation on the server
          const response = await axiosInstance.post("/messages/conversation", {
            participants: [currentUserId, targetUserId],
          });

          // Axios responses typically look like { data: {...}, status, headers, ... }
          const newConversation = response.data.conversation;

          if (
            !newConversation ||
            !Array.isArray(newConversation.participants)
          ) {
            throw new Error(
              "Invalid response format when creating conversation"
            );
          }

          // Update UI state
          setCurrentConversation(newConversation);
          setChatHistory((prev) => [newConversation, ...prev]);
        }
      } catch (error) {
        console.error("Failed to select conversation:", error);
        throw new Error(
          `Could not start conversation: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    },
    [currentUserId, chatHistory, setCurrentConversation, setChatHistory]
  );

  // Clear current conversation
  const clearCurrentConversation = useCallback(() => {
    setCurrentConversation(null);
    clearMessages();
  }, [setCurrentConversation, clearMessages]);

  return {
    currentConversation,
    messages,
    chatHistory,
    setChatHistory,
    addMessage,
    handleSelectConversation,
    handleReceivedMessage,
    clearCurrentConversation,
    refetchChatHistory,
  };
};
