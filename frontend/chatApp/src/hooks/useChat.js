// hooks/useChat.js
import { useEffect, useCallback } from "react";
import { useSocket } from "./useSocket";
import { useUserSearch } from "./useUserSearch";
import { useConversationManager } from "./useConversationManager";
import { useMessageSender } from "./useMessageSender";
import { useSocketEvents } from "./useSocketEvents";

export const useChat = (currentUserId) => {
  // State management
  const conversationManager = useConversationManager(currentUserId);
  const { 
    currentConversation, 
    messages, 
    chatHistory, 
    addMessage, 
    handleSelectConversation,
    setChatHistory 
  } = conversationManager;
  
  // User search
  const userSearch = useUserSearch();
  
  // Socket connection
  const socket = useSocket(currentUserId);
  const { 
    socket: socketInstance, 
    onlineUsers, 
    typingUser, 
    isConnected, 
    on, 
    off, 
    emit, 
    startTyping,  
    stopTyping 
  } = socket;

  // Message sending
  const messageSender = useMessageSender({
    currentUserId,
    currentConversation,
    emit,
    addMessage,
    stopTyping
  });

  // Socket events
  useSocketEvents({
    socket: socketInstance,
    currentUserId,
    currentConversation,
    on,
    off,
    addMessage,
    handleReceivedMessage: conversationManager.handleReceivedMessage,
    handleSelectConversation
  });

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (currentConversation && currentUserId) {
        stopTyping({ to: currentConversation._id, from: currentUserId });
      }
    };
  }, [currentConversation, currentUserId, stopTyping]);

  // Combined handlers
  const handleSend = useCallback((text, images = []) => {
    return messageSender.handleSend(text, images);
  }, [messageSender]);

  const handleTyping = useCallback(() => {
    return messageSender.handleTyping();
  }, [messageSender]);

  return {
    // State
    currentConversation,
    messages,
    users: userSearch.users,
    searchTerm: userSearch.searchTerm,
    loading: userSearch.loading,
    onlineUsers,
    chatHistory,
    typingUser,
    isConnected,

    // Setters
    setSearchTerm: userSearch.setSearchTerm,
    setChatHistory,

    // Actions
    handleSelectConversation,
    handleSend,
    handleTyping,
  };
};