// hooks/useMessages.js
import { useState, useEffect, useCallback, useRef } from "react";
import axiosInstance from "../lib/axios";

export const useMessages = (currentConversation) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesRef = useRef(messages);

  // keep messagesRef updated
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

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

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  // ✅ FIX: use functional update with ref to ensure always latest state
  const addMessage = useCallback((message) => {
  if (!message) return;

  setMessages((prev) => {
    const exists = prev.some((m) => m._id && m._id === message._id);
    if (exists) return prev;

    const optimisticIdx = prev.findIndex(
      (m) =>
        m._id?.startsWith("temp-") &&
        m.message === message.message &&
        m.sender?._id === message.sender?._id
    );

    const updated = [...prev];

    if (optimisticIdx > -1) {
      updated[optimisticIdx] = { ...message, status: "sent" };
    } else {
      updated.push(message);
    }

    return updated.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  });
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
