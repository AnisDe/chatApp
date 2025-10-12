// hooks/useMessages.js
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../lib/axios";

export const useMessages = (currentUserId, currentChatUser) => {
  const [messages, setMessages] = useState([]);

  const loadMessages = useCallback(async (user1, user2) => {
    try {
      const res = await axiosInstance.get("/messages", {
        params: { user1, user2 },
      });
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
    setMessages(prev => [...prev, message]);
  }, []);

  // Load messages when chat user changes
  useEffect(() => {
    if (currentChatUser && currentUserId) {
      loadMessages(currentUserId, currentChatUser._id);
    } else {
      clearMessages();
    }
  }, [currentUserId, currentChatUser, loadMessages, clearMessages]);

  return {
    messages,
    setMessages,
    addMessage,
    clearMessages,
    loadMessages,
  };
};