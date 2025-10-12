// hooks/useChatHistory.js
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../lib/axios";

export const useChatHistory = (currentUserId) => {
  const [chatHistory, setChatHistory] = useState([]);

  const updateChatHistory = useCallback((userId, username, message) => {
    setChatHistory((prev) => {
      const updated = [...prev];
      const idx = updated.findIndex((u) => u._id === userId);
      const entry = {
        _id: userId,
        username,
        lastMessage: message,
        lastTimestamp: new Date().toISOString(),
      };
      if (idx !== -1) updated[idx] = entry;
      else updated.unshift(entry);
      return updated.sort(
        (a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp),
      );
    });
  }, []);

  const handleReceivedMessage = useCallback((msg) => {
    const senderId = msg.sender._id || msg.sender;
    const senderName = msg.sender.username || msg.fromUsername || "Unknown";
    
    setChatHistory((prev) => {
      const updated = [...prev];
      const index = updated.findIndex((u) => u._id === senderId);
      const now = new Date().toISOString();

      if (index !== -1) {
        const [user] = updated.splice(index, 1);
        user.lastMessage = msg.message;
        user.lastTimestamp = now;
        updated.unshift(user);
      } else {
        updated.unshift({
          _id: senderId,
          username: senderName,
          lastMessage: msg.message,
          lastTimestamp: now,
        });
      }
      return updated;
    });
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    axiosInstance
      .get(`/messages/history/${currentUserId}`)
      .then((res) => {
        const sorted = res.data.sort(
          (a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp),
        );
        setChatHistory(sorted);
      })
      .catch((err) => console.error("Failed to fetch chat history:", err));
  }, [currentUserId]);

  return {
    chatHistory,
    updateChatHistory,
    handleReceivedMessage,
  };
};