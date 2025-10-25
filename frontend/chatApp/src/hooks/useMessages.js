// hooks/useMessages.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";

export const useMessages = (currentConversation) => {
  const queryClient = useQueryClient();

  // Fetch messages for current conversation
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

  // Mutation for sending messages
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      const response = await axiosInstance.post("/messages/send", messageData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate messages query to refetch
      queryClient.invalidateQueries({
        queryKey: ["messages", currentConversation?._id],
      });
    },
  });

  const clearMessages = () => {
    // With React Query, clearing means resetting to empty array
    queryClient.setQueryData(["messages", currentConversation?._id], []);
  };

  return {
    messages,
    loading,
    error,
    addMessage: sendMessageMutation.mutate,
    clearMessages,
    refetch: () =>
      queryClient.invalidateQueries({
        queryKey: ["messages", currentConversation?._id],
      }),
  };
};
