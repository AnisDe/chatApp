// hooks/useConversationManager.js
import { useCallback } from "react";
import { useChatStore } from "../store/chatStore";
import { useChatHistory } from "./useChatHistory";
import { useMessages } from "./useMessages";

export const useConversationManager = (currentUserId) => {
  const { currentConversation, setCurrentConversation } = useChatStore();
  const { chatHistory, setChatHistory } = useChatHistory(currentUserId);
  const { messages, setMessages, addMessage } = useMessages(currentConversation);

  const handleSelectConversation = useCallback(
    async (conversationOrUser) => {
      try {
        // Case 1️⃣: Existing conversation clicked
        if (conversationOrUser.participants) {
          setCurrentConversation(conversationOrUser);
          const res = await axiosInstance.get(`/messages/${conversationOrUser._id}`);
          setMessages(res.data);
          return;
        }

        // Case 2️⃣: User selected from search
        const existingConversation = chatHistory.find((conv) =>
          conv.participants.some((p) => p._id === conversationOrUser._id)
        );

        if (existingConversation) {
          setCurrentConversation(existingConversation);
          const res = await axiosInstance.get(`/messages/${existingConversation._id}`);
          setMessages(res.data);
        } else {
          const newConv = await axiosInstance.post("/conversations", {
            participants: [currentUserId, conversationOrUser._id],
          });
          setCurrentConversation(newConv.data);
          setChatHistory((prev) => [newConv.data, ...prev]);
          setMessages([]);
        }
      } catch (err) {
        console.error("Failed to select conversation:", err);
        throw err; // Let the caller handle the error
      }
    },
    [currentUserId, chatHistory, setCurrentConversation, setChatHistory, setMessages]
  );

  return {
    currentConversation,
    messages,
    chatHistory,
    setChatHistory,
    addMessage,
    handleSelectConversation,
  };
};