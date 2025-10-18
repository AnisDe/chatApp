// hooks/useMessages.js
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../lib/axios";

export const useMessages = (currentConversation) => {
  const [messages, setMessages] = useState([]);

  // ✅ Load all messages for a conversation
  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;
    try {
      const res = await axiosInstance.get(`/messages/${conversationId}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      setMessages([]);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  // ✅ Fetch messages when conversation changes
  useEffect(() => {
    if (currentConversation?._id) {
      loadMessages(currentConversation._id);
    } else {
      clearMessages();
    }
  }, [currentConversation, loadMessages, clearMessages]);

  return {
    messages,
    setMessages,
    addMessage,
    clearMessages,
    loadMessages,
  };
};
