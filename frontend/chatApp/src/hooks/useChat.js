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
  const { currentConversation, setCurrentConversation } = useChatStore();

  const currentConversationRef = useRef(currentConversation);
  currentConversationRef.current = currentConversation;

  // ✅ include setChatHistory from the hook
  const { chatHistory, setChatHistory, handleReceivedMessage } =
    useChatHistory(currentUserId);

  const { users, searchTerm, setSearchTerm, loading } = useUserSearch();
  const { messages, setMessages, addMessage } =
    useMessages(currentConversation);
  const {
    socket,
    onlineUsers,
    typingUser,
    isConnected,
    on,
    off,
    emit,
    startTyping,
    stopTyping,
  } = useSocket(currentUserId, currentConversationRef);

  /** 🔔 notifications */
  const handleNotification = useCallback((notif) => {
    const { from, fromUsername, messagePreview, conversationId } = notif;
    const currentConv = currentConversationRef.current;
    if (!currentConv || currentConv._id !== conversationId) {
      toast.info(`New message from ${fromUsername}: ${messagePreview}`, {
        ...TOAST_OPTIONS,
        onClick: () =>
          handleSelectConversation({
            _id: conversationId,
            participants: [{ _id: from, username: fromUsername }],
          }),
      });
    }
  }, []);

  /** ⚡ socket listeners */
  const setupSocketEvents = useCallback(() => {
    if (!socket) return;

    const handlePrivateMessage = (msg) => {
      const currentConv = currentConversationRef.current;

      // 🧠 If the message was sent by the current user
      if (msg.sender?._id === currentUserId) {
        //  Update sidebar only (don’t add duplicate in the chat window)
        handleReceivedMessage(msg);
        return;
      }

      // 🧠 If the message belongs to the current open conversation
      if (currentConv && msg.conversationId === currentConv._id) {
        addMessage(msg);
      }

      //  Always update sidebar (for both sender and receiver)
      handleReceivedMessage(msg);
    };

    //  Register socket listeners
    on("private_message", handlePrivateMessage);
    on("notification", handleNotification);

    //  Clean up when component unmounts or socket changes
    return () => {
      off("private_message", handlePrivateMessage);
      off("notification", handleNotification);
    };
  }, [
    socket,
    on,
    off,
    addMessage,
    handleReceivedMessage,
    handleNotification,
    currentUserId, // 👈 added dependency
  ]);

  useEffect(() => {
    const cleanup = setupSocketEvents();
    return cleanup;
  }, [setupSocketEvents]);

  /** 🧹 stop typing when leaving chat */
  useEffect(() => {
    return () => {
      if (currentConversation && currentUserId) {
        stopTyping({ to: currentConversation._id, from: currentUserId });
      }
    };
  }, [currentConversation, currentUserId, stopTyping]);

  /**  select conversation (from sidebar or search) */
  const handleSelectConversation = useCallback(
    (conversationOrUser) => {
      if (conversationOrUser.participants) {
        setCurrentConversation(conversationOrUser);
      } else {
        setCurrentConversation({
          _id: null,
          participants: [
            { _id: currentUserId },
            {
              _id: conversationOrUser._id,
              username: conversationOrUser.username,
            },
          ],
        });
      }
      setMessages([]);
    },
    [setCurrentConversation, setMessages, currentUserId],
  );

  /**  send message */
  const handleSend = useCallback(
    (text) => {
      if (!text.trim() || !currentConversation) return;
      const receiver = currentConversation.participants.find(
        (p) => p._id !== currentUserId,
      );
      if (!receiver) return;

      emit("private_message", {
        to: receiver._id,
        message: text,
        conversationId: currentConversation._id,
      });

      const newMessage = {
        sender: { _id: currentUserId },
        receiver: receiver._id,
        message: text,
        conversationId: currentConversation._id,
      };

      addMessage(newMessage);
      stopTyping({ to: receiver._id, from: currentUserId });
    },
    [currentConversation, currentUserId, emit, addMessage, stopTyping],
  );

  /** ✍️ typing indicator */
  const handleTyping = useCallback(() => {
    if (!currentConversation) return;
    const receiver = currentConversation.participants.find(
      (p) => p._id !== currentUserId,
    );
    if (receiver) startTyping({ to: receiver._id, from: currentUserId });
  }, [currentConversation, currentUserId, startTyping]);

  return {
    // state
    currentConversation,
    messages,
    users,
    searchTerm,
    loading,
    onlineUsers,
    chatHistory,
    typingUser,
    isConnected,

    // ✅ add this to expose the setter
    setChatHistory,

    // actions
    handleSelectConversation,
    handleSend,
    handleTyping,
    setSearchTerm,
  };
};
