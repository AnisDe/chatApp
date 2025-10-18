// hooks/useChatHistory.js
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../lib/axios";

export const useChatHistory = (currentUserId) => {
  const [chatHistory, setChatHistory] = useState([]);

  // Update sidebar when a new message arrives
 //  Update sidebar when a new message arrives (for both sender & receiver)
const handleReceivedMessage = useCallback(
  (msg) => {
    setChatHistory((prev) => {
      const updated = [...prev];
      const idx = updated.findIndex((c) => c._id === msg.conversationId);
      const now = new Date().toISOString();

      // 🧠 Identify participants properly
      const sender = {
        _id: msg.sender?._id || msg.sender,
        username: msg.sender?.username || msg.fromUsername || "Unknown",
      };
      const receiver = {
        _id: msg.receiver?._id || msg.receiver,
        username: msg.receiver?.username || msg.toUsername || "Unknown",
      };

      if (idx !== -1) {
        // 🧩 Update existing conversation
        const [conv] = updated.splice(idx, 1);
        conv.lastMessage = { message: msg.message, sender };
        conv.lastMessageAt = now;
        updated.unshift(conv);
      } else {
        // 🆕 Create a new conversation entry
        updated.unshift({
          _id: msg.conversationId,
          participants: [sender, receiver],
          lastMessage: { message: msg.message, sender },
          lastMessageAt: now,
        });
      }

      return updated;
    });
  },
  [setChatHistory]
);


  // Fetch chat list (conversations)
  useEffect(() => {
    if (!currentUserId) return;

    axiosInstance
      .get(`/messages/history/${currentUserId}`)
      .then((res) => {
        const sorted = res.data.sort(
          (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt),
        );
        setChatHistory(sorted);
      })
      .catch((err) => console.error("Failed to fetch conversations:", err));
  }, [currentUserId]);

  return {
    chatHistory,
    handleReceivedMessage,
    setChatHistory,
  };
};
