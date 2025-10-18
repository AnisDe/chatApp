import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useChatStore = create(
  persist(
    (set) => ({
      currentConversation: null,

      setCurrentConversation: (conversation) =>
        set({ currentConversation: conversation }),

      clearConversation: () => set({ currentConversation: null }),
    }),
    {
      name: "chat-storage", // key in localStorage
      partialize: (state) => ({
        currentConversation: state.currentConversation,
      }),
    },
  ),
);
