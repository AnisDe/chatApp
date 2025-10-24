// hooks/useSocketEvents.js
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";

const TOAST_OPTIONS = {
  position: "top-right",
  autoClose: 4000,
  pauseOnHover: true,
};

/**
 * Keeps socket event listeners stable across re-renders.
 * Works even when currentConversation or addMessage changes dynamically.
 */
export const useSocketEvents = ({
  socket,
  currentUserId,
  currentConversation,
  on,
  off,
  addMessage,
  handleReceivedMessage,
  handleSelectConversation,
}) => {
  const currentConvRef = useRef(currentConversation);
  const currentUserRef = useRef(currentUserId);
  const addMessageRef = useRef(addMessage);
  const handleReceivedMessageRef = useRef(handleReceivedMessage);

  // Keep refs current value of the dependencies
  useEffect(() => {
    currentConvRef.current = currentConversation;
    currentUserRef.current = currentUserId;
    addMessageRef.current = addMessage;
    handleReceivedMessageRef.current = handleReceivedMessage;
  }, [currentConversation, currentUserId, addMessage, handleReceivedMessage]);

  // Setup only once on mount
  useEffect(() => {
    if (!socket) return;

    const handlePrivateMessage = (message) => {
      const activeConv = currentConvRef.current;
      const userId = currentUserRef.current;
      const addMsg = addMessageRef.current;
      const handleMsg = handleReceivedMessageRef.current;
      if (!message) return;

      // Always update sidebar
      if (handleMsg) handleMsg(message);

      // Add to chat window only if this is the active conversation
      if (activeConv && message.conversationId === activeConv._id) {
        addMsg(message);
      }
    };

    const handleNotification = (notification) => {
      const { from, fromUsername, messagePreview, conversationId } =
        notification;
      const activeConv = currentConvRef.current;

      if (!activeConv || activeConv._id !== conversationId) {
        toast.info(`New message from ${fromUsername}: ${messagePreview}`, {
          position: "top-right",
          autoClose: 4000,
          pauseOnHover: true,
          onClick: () =>
            handleSelectConversation({
              _id: conversationId,
              participants: [{ _id: from, username: fromUsername }],
            }),
        });
      }
    };

    // Register listeners once
    socket.on("private_message", handlePrivateMessage);
    socket.on("notification", handleNotification);

    // Cleanup on unmount
    return () => {
      socket.off("private_message", handlePrivateMessage);
      socket.off("notification", handleNotification);
    };
  }, [socket, handleSelectConversation]);
};
