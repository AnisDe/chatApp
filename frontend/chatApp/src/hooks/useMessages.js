import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";

export const useMessages = (currentConversation) => {
  const queryClient = useQueryClient();

  // Fetch messages for the current conversation
  const {
    data: messages = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["messages", currentConversation?._id],
    queryFn: async () => {
      if (!currentConversation?._id) return [];
      const response = await axiosInstance.get(
        `/messages/${currentConversation._id}`
      );
      return (response.data || []).sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    },
    enabled: !!currentConversation?._id,
  });

  // Local mutation (manual optimistic sync)
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      const response = await axiosInstance.post("/messages/send", messageData);
      return response.data.data;
    },
  });

  // Add message manually (for optimistic updates)
  const addMessage = (msg) => {
    if (!currentConversation?._id) return;
    queryClient.setQueryData(
      ["messages", currentConversation._id],
      (old = []) => {
        const exists = old.some((m) => m._id === msg._id);
        if (exists) return old;
        return [...old, msg].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      }
    );
  };

  // Replace optimistic message with confirmed one
  const replaceMessage = (tempId, realMessage) => {
    if (!currentConversation?._id) return;
    queryClient.setQueryData(
      ["messages", currentConversation._id],
      (old = []) => old.map((m) => (m._id === tempId ? realMessage : m))
    );
  };

  // Clear messages (used when switching conversation)
  const clearMessages = () => {
    queryClient.setQueryData(["messages", currentConversation?._id], []);
  };

  return {
    messages,
    loading,
    error,
    addMessage,
    replaceMessage,
    sendMessageMutation,
    clearMessages,
  };
};
