// hooks/useConversationManager.js
import { useState, useEffect, useCallback } from "react";
import { useChatStore } from "../store/chatStore";
import { useMessages } from "./useMessages";
import axiosInstance from "../lib/axios";

export const useConversationManager = (currentUserId) => {
  const { currentConversation, setCurrentConversation } = useChatStore();
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { messages, setMessages, addMessage, clearMessages } =
    useMessages(currentConversation);

  // Normalize participant data
  const normalizeParticipant = useCallback((participant) => {
    if (!participant) return null;
    return {
      _id: participant._id || participant,
      username: participant.username || "Unknown User",
    };
  }, []);

  // Update sidebar when a new message arrives
  const handleReceivedMessage = useCallback(
    (msg) => {
      setChatHistory((prev) => {
        const now = new Date().toISOString();
        const existingConvIndex = prev.findIndex(
          (conv) => conv._id === msg.conversationId
        );

        if (existingConvIndex > -1) {
          // Update existing conversation
          const updated = [...prev];
          const [existingConv] = updated.splice(existingConvIndex, 1);

          return [
            {
              ...existingConv,
              lastMessage: {
                message: msg.message,
                sender: normalizeParticipant(msg.sender),
              },
              lastMessageAt: now,
            },
            ...updated,
          ];
        } else {
          // Create new conversation entry
          const sender = normalizeParticipant(msg.sender);
          const receiver = normalizeParticipant(msg.receiver);

          const newConversation = {
            _id: msg.conversationId,
            participants: [sender, receiver].filter(Boolean),
            lastMessage: {
              message: msg.message,
              sender,
            },
            lastMessageAt: now,
          };

          return [newConversation, ...prev];
        }
      });
    },
    [normalizeParticipant]
  );

  // Fetch chat history
  const fetchChatHistory = useCallback(async () => {
    if (!currentUserId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(
        `/messages/history/${currentUserId}`
      );
      const sortedHistory = response.data.sort(
        (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
      );
      setChatHistory(sortedHistory);
    } catch (err) {
      console.error("Failed to fetch chat history:", err);
      setError("Failed to load conversations");
      setChatHistory([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

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
    [currentUserId, chatHistory, setCurrentConversation]
  );

  // Clear current conversation
  const clearCurrentConversation = useCallback(() => {
    setCurrentConversation(null);
    clearMessages();
  }, [setCurrentConversation, clearMessages]);

  // Initial load
  useEffect(() => {
    fetchChatHistory();
  }, [fetchChatHistory]);

  return {
    currentConversation,
    messages,
    chatHistory,
    setChatHistory,
    addMessage,
    handleSelectConversation,
    handleReceivedMessage,
    clearCurrentConversation,
    refetchChatHistory: fetchChatHistory,
    loading,
    error,
  };
};
