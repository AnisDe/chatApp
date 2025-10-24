// hooks/useMessages.js
import { useEffect, useCallback, useState } from "react";
import axiosInstance from "../lib/axios";
import { useChatStore } from "../store/chatStore";

export const useMessages = (currentConversation) => {
  const { messages, setMessages, addMessage, clearMessages } = useChatStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return setMessages([]);

    setLoading(true);
    setError(null);

    try {
      const res = await axiosInstance.get(`/messages/${conversationId}`);
      const sorted = (res.data || []).sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      setMessages(sorted);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      setError("Failed to load messages");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentConversation?._id) loadMessages(currentConversation._id);
    else clearMessages();
  }, [currentConversation?._id, loadMessages, clearMessages]);

  return {
    messages,
    loading,
    error,
    setMessages,
    addMessage,
    clearMessages,
    refetch: () =>
      currentConversation?._id && loadMessages(currentConversation._id),
  };
};
