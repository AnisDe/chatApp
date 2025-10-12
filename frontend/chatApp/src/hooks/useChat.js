// hooks/useChat.js
import { useCallback, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { useChatStore } from "../store/chatStore";
import { useSocket } from "./useSocket";
import { useChatHistory } from "./useChatHistory";
import { useUserSearch } from "./useUserSearch";
import { useMessages } from "./useMessages";

const TOAST_OPTIONS = {
  position: "top-right",
  autoClose: 5000,
  closeOnClick: true,
  pauseOnHover: true,
};

export const useChat = (currentUserId) => {
  const { currentChatUser, setCurrentChatUser } = useChatStore();
  
  // Refs for current values
  const currentChatUserRef = useRef(currentChatUser);
  currentChatUserRef.current = currentChatUser;

  // Compose all hooks
  const { chatHistory, updateChatHistory, handleReceivedMessage } = useChatHistory(currentUserId);
  const { users, searchTerm, setSearchTerm, loading } = useUserSearch();
  const { messages, setMessages, addMessage } = useMessages(currentUserId, currentChatUser);
  const { 
    socket, 
    onlineUsers, 
    typingUser, 
    isConnected,
    on, 
    off,
    emit, 
    startTyping, 
    stopTyping 
  } = useSocket(currentUserId, currentChatUserRef);

  // Handle user selection from notification
  const selectUserFromNotification = useCallback((userId, username) => {
    // Find the user in chat history or search for them
    const userFromHistory = chatHistory.find(u => u._id === userId);
    if (userFromHistory) {
      handleSelectUser(userFromHistory);
    } else {
      // Create a temporary user object if not found in history
      const tempUser = {
        _id: userId,
        username: username,
        lastMessage: "",
        lastTimestamp: new Date().toISOString(),
      };
      handleSelectUser(tempUser);
    }
  }, [chatHistory]);

  // Notification handler
  const handleNotification = useCallback((data) => {
    const { sender, messagePreview, fromUsername, from } = data;
    const chatUser = currentChatUserRef.current;
    
    // Show notification only if the message is not from the current chat user
    if (!chatUser || chatUser._id !== sender) {
      toast.info(`New message from ${fromUsername}: ${messagePreview}`, {
        ...TOAST_OPTIONS,
        onClick: () => selectUserFromNotification(from || sender, fromUsername),
      });
    }
  }, [selectUserFromNotification]);

  // Socket event setup
  const setupSocketEvents = useCallback(() => {
    if (!socket) return;

    // Private messages handler
    const handlePrivateMessage = (msg) => {
      addMessage(msg);
      handleReceivedMessage(msg);
    };

    // Register event handlers
    on("private_message", handlePrivateMessage);
    on("notification", handleNotification);

    // Cleanup function
    return () => {
      off("private_message", handlePrivateMessage);
      off("notification", handleNotification);
    };
  }, [socket, on, off, addMessage, handleReceivedMessage, handleNotification]);

  // Setup and cleanup socket events
  useEffect(() => {
    const cleanup = setupSocketEvents();
    return cleanup;
  }, [setupSocketEvents]);

  // Clear typing when chat user changes or component unmounts
  useEffect(() => {
    return () => {
      if (currentChatUser && currentUserId) {
        stopTyping({
          to: currentChatUser._id,
          from: currentUserId
        });
      }
    };
  }, [currentChatUser, currentUserId, stopTyping]);

  // User selection
  const handleSelectUser = useCallback((user) => {
    setCurrentChatUser(user);
    setMessages([]);
  }, [setCurrentChatUser, setMessages]);

  // Send message
  const handleSend = useCallback((text) => {
    if (!text.trim() || !currentChatUser) return;

    emit("private_message", { 
      to: currentChatUser._id, 
      message: text 
    });

    const newMessage = {
      sender: currentUserId,
      receiver: currentChatUser._id,
      message: text,
    };

    addMessage(newMessage);
    updateChatHistory(currentChatUser._id, currentChatUser.username, text);
    
    // Stop typing when message is sent
    stopTyping({ 
      to: currentChatUser._id, 
      from: currentUserId 
    });

    return newMessage;
  }, [currentChatUser, currentUserId, emit, addMessage, updateChatHistory, stopTyping]);

  // Typing handler
  const handleTyping = useCallback(() => {
    if (!currentChatUser) return;

    startTyping({
      to: currentChatUser._id,
      from: currentUserId,
    });
  }, [currentChatUser, currentUserId, startTyping]);

  return {
    // State
    currentChatUser,
    messages,
    users,
    searchTerm,
    loading,
    onlineUsers,
    chatHistory,
    typingUser,
    isConnected,
    
    // Actions
    setCurrentChatUser,
    handleSelectUser,
    handleSend,
    handleTyping,
    setSearchTerm,
    selectUserFromNotification,
  };
};