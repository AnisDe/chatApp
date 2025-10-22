// hooks/useChatHistory.js
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../lib/axios";

export const useChatHistory = (currentUserId) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Normalize participant data
  const normalizeParticipant = useCallback((participant) => {
    if (!participant) return null;
    return {
      _id: participant._id || participant,
      username: participant.username || "Unknown User"
    };
  }, []);

  // Update sidebar when a new message arrives
  const handleReceivedMessage = useCallback((msg) => {
    setChatHistory(prev => {
      const now = new Date().toISOString();
      const existingConvIndex = prev.findIndex(conv => conv._id === msg.conversationId);
      
      if (existingConvIndex > -1) {
        // Update existing conversation
        const updated = [...prev];
        const [existingConv] = updated.splice(existingConvIndex, 1);
        
        return [{
          ...existingConv,
          lastMessage: { 
            message: msg.message, 
            sender: normalizeParticipant(msg.sender) 
          },
          lastMessageAt: now
        }, ...updated];
      } else {
        // Create new conversation entry
        const sender = normalizeParticipant(msg.sender);
        const receiver = normalizeParticipant(msg.receiver);
        
        const newConversation = {
          _id: msg.conversationId,
          participants: [sender, receiver].filter(Boolean),
          lastMessage: { 
            message: msg.message, 
            sender 
          },
          lastMessageAt: now
        };
        
        return [newConversation, ...prev];
      }
    });
  }, [normalizeParticipant]);

  // Fetch chat history
  const fetchChatHistory = useCallback(async () => {
    if (!currentUserId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.get(`/messages/history/${currentUserId}`);
      const sortedHistory = response.data.sort(
        (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
      );
      setChatHistory(sortedHistory);
    } catch (err) {
      console.error("Failed to fetch chat history:", err);
      setError("Failed to load conversations");
      setChatHistory([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Initial load
  useEffect(() => {
    fetchChatHistory();
  }, [fetchChatHistory]);

  return {
    chatHistory,
    loading,
    error,
    handleReceivedMessage,
    setChatHistory,
    refetch: fetchChatHistory
  };
};