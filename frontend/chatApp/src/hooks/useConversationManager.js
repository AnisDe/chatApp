// hooks/useConversationManager.js
import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useChatStore } from "../store/chatStore";
import { useMessages } from "./useMessages";
import axiosInstance from "../lib/axios";

export const useConversationManager = (currentUserId) => {
  const { currentConversation, setCurrentConversation } = useChatStore();
  const queryClient = useQueryClient();

  // This should now be the React Query version of useMessages
  const {
    messages,
    addMessage,
    clearMessages,
    replaceMessage,
    loading: messagesLoading,
    error: messagesError,
  } = useMessages(currentConversation);

  // Normalize participant data
  const normalizeParticipant = useCallback((participant) => {
    if (!participant) return null;
    return {
      _id: participant._id || participant,
      username: participant.username || "Unknown User",
    };
  }, []);

  // Fetch chat history with React Query
  const {
    data: chatHistory = [],
    isLoading: historyLoading,
    error: historyError,
    refetch: refetchChatHistory,
  } = useQuery({
    queryKey: ["chatHistory", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];

      const response = await axiosInstance.get(
        `/messages/history/${currentUserId}`
      );
      return response.data.sort(
        (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
      );
    },
    enabled: !!currentUserId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
  });

  // Mutation for creating a new conversation
  const createConversationMutation = useMutation({
    mutationFn: async (participants) => {
      const response = await axiosInstance.post("/messages/conversation", {
        participants,
      });
      return response.data.conversation;
    },
    onSuccess: (newConversation) => {
      // Update the chat history cache with the new conversation
      queryClient.setQueryData(
        ["chatHistory", currentUserId],
        (oldData = []) => {
          return [newConversation, ...oldData];
        }
      );
    },
  });

  // Update sidebar when a new message arrives
  const handleReceivedMessage = useCallback(
    (msg) => {
      queryClient.setQueryData(
        ["chatHistory", currentUserId],
        (oldData = []) => {
          const now = new Date().toISOString();
          const existingConvIndex = oldData.findIndex(
            (conv) => conv._id === msg.conversationId
          );

          if (existingConvIndex > -1) {
            // Update existing conversation
            const updated = [...oldData];
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

            return [newConversation, ...oldData];
          }
        }
      );

      // Also invalidate the current conversation's messages if this message belongs to it
      if (currentConversation?._id === msg.conversationId) {
        queryClient.invalidateQueries({
          queryKey: ["messages", msg.conversationId],
        });
      }
    },
    [normalizeParticipant, queryClient, currentUserId, currentConversation]
  );

  const handleSelectConversation = useCallback(
    (conversationOrUser) => {
      if (!currentUserId) throw new Error("User must be logged in");

      // Existing conversation (from history)
      if (Array.isArray(conversationOrUser.participants)) {
        setCurrentConversation(conversationOrUser);
        return;
      }

      // New user from search (no conversation yet)
      const targetUserId = conversationOrUser._id;
      if (!targetUserId) throw new Error("Invalid user");

      // Check if conversation already exists
      const existingConversation = chatHistory.find((conv) =>
        conv.participants?.some((p) => p._id === targetUserId)
      );

      if (existingConversation) {
        setCurrentConversation(existingConversation);
      } else {
        // 🟩 Build a temporary "pending" conversation with visible username
        setCurrentConversation({
          participants: [
            { _id: currentUserId }, // current user (can remain minimal)
            {
              _id: conversationOrUser._id,
              username: conversationOrUser.username || "Unknown User",
              profilePic: conversationOrUser.profilePic || null, // optional
            },
          ],
          isPending: true,
        });
      }
    },
    [currentUserId, chatHistory, setCurrentConversation]
  );

  // Clear current conversation
  const clearCurrentConversation = useCallback(() => {
    setCurrentConversation(null);
    clearMessages();
  }, [setCurrentConversation, clearMessages]);

  // Invalidate and refetch chat history when needed
  const invalidateChatHistory = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["chatHistory", currentUserId] });
  }, [queryClient, currentUserId]);

  return {
    currentConversation,
    messages,
    replaceMessage,
    chatHistory,
    addMessage,
    handleSelectConversation,
    handleReceivedMessage,
    clearCurrentConversation,
    refetchChatHistory,
    invalidateChatHistory,
    loading: historyLoading || messagesLoading,
    error: historyError || messagesError,
    isCreatingConversation: createConversationMutation.isPending,
  };
};
