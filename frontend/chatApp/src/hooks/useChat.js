// hooks/useChat.js
import { useEffect } from "react";
import { useSocket } from "./useSocket";
import { useUserSearch } from "./useUserSearch";
import { useConversationManager } from "./useConversationManager";
import { useMessageSender } from "./useMessageSender";
import { useSocketEvents } from "./useSocketEvents";

export const useChat = (currentUserId) => {
  // State management
  const conversationManager = useConversationManager(currentUserId);
  const { currentConversation, chatHistory, addMessage, handleSelectConversation } = conversationManager;
  
  // User search
  const userSearch = useUserSearch();
  
  // Socket connection
  const socket = useSocket(currentUserId, { current: currentConversation });
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
  const messageSender = useMessageSender(
    currentUserId,
    currentConversation,
    emit,
    addMessage,
    stopTyping,
    startTyping 
  );

  // Socket events
  useSocketEvents(
    socketInstance,
    currentUserId,
    currentConversation,
    on,
    off,
    addMessage,
    conversationManager.handleReceivedMessage || (() => {}),
    handleSelectConversation
  );

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (currentConversation && currentUserId) {
        stopTyping({ to: currentConversation._id, from: currentUserId });
      }
    };
  }, [currentConversation, currentUserId, stopTyping]);

  return {
    // State
    currentConversation: conversationManager.currentConversation,
    messages: conversationManager.messages,
    users: userSearch.users,
    searchTerm: userSearch.searchTerm,
    loading: userSearch.loading,
    onlineUsers,
    chatHistory: conversationManager.chatHistory,
    typingUser,
    isConnected,

    // Setters
    setChatHistory: conversationManager.setChatHistory,
    setSearchTerm: userSearch.setSearchTerm,

    // Actions
    handleSelectConversation,
    handleSend: messageSender.handleSend,
    handleTyping: messageSender.handleTyping,
  };
};