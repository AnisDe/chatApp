// hooks/useSocketEvents.js
import { useCallback, useEffect, useRef } from "react";
import { toast } from "react-toastify";

const TOAST_OPTIONS = {
  position: "top-right",
  autoClose: 5000,
  closeOnClick: true,
  pauseOnHover: true,
};

export const useSocketEvents = (
  socket,
  currentUserId,
  currentConversation,
  on,
  off,
  addMessage,
  handleReceivedMessage,
  handleSelectConversation
) => {
  const currentConversationRef = useRef(currentConversation);
  currentConversationRef.current = currentConversation;

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
  }, [handleSelectConversation]);

  const setupSocketEvents = useCallback(() => {
    if (!socket) return;

    const handlePrivateMessage = (msg) => {
      const currentConv = currentConversationRef.current;

      if (msg.sender?._id === currentUserId) {
        handleReceivedMessage(msg);
        return;
      }

      if (currentConv && msg.conversationId === currentConv._id) {
        addMessage(msg);
      }

      handleReceivedMessage(msg);
    };

    on("private_message", handlePrivateMessage);
    on("notification", handleNotification);

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
    currentUserId,
  ]);

  useEffect(() => {
    const cleanup = setupSocketEvents();
    return cleanup;
  }, [setupSocketEvents]);

  return {
    handleNotification,
  };
};