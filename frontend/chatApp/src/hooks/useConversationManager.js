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
          // Create new conversation using mutation
          const newConversation = await createConversationMutation.mutateAsync([
            currentUserId,
            targetUserId,
          ]);

          if (
            !newConversation ||
            !Array.isArray(newConversation.participants)
          ) {
            throw new Error(
              "Invalid response format when creating conversation"
            );
          }

          setCurrentConversation(newConversation);
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
    [
      currentUserId,
      chatHistory,
      setCurrentConversation,
      createConversationMutation,
    ]
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
