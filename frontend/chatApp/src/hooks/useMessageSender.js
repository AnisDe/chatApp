// hooks/useMessageSender.js
import { useCallback } from "react";

export const useMessageSender = (
  currentUserId, 
  currentConversation, 
  emit, 
  addMessage, 
  stopTyping,
  startTyping  
) => {
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

  const handleTyping = useCallback(() => {
    if (!currentConversation) return;
    const receiver = currentConversation.participants.find(
      (p) => p._id !== currentUserId,
    );
    if (receiver) startTyping({ to: receiver._id, from: currentUserId });
  }, [currentConversation, currentUserId, startTyping]);

  return {
    handleSend,
    handleTyping,
  };
};