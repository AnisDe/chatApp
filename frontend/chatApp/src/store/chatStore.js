// store/chatStore.js - CLEANED UP VERSION
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useChatStore = create(
  persist(
    (set, get) => ({
      // --- Conversation --- (keep this - it's UI state)
      currentConversation: null,
      setCurrentConversation: (conversation) =>
        set({ currentConversation: conversation }),
      clearConversation: () => set({ currentConversation: null }),
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        currentConversation: state.currentConversation,
      }),
    }
  )
);
