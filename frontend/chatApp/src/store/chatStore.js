// src/store/chatStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useChatStore = create(
  persist(
    (set) => ({
      currentChatUser: null,
      setCurrentChatUser: (user) => set({ currentChatUser: user }),
      clearChatUser: () => set({ currentChatUser: null }),
    }),
    {
      name: "chat-storage", // key in localStorage
      partialize: (state) => ({ currentChatUser: state.currentChatUser }), // store only this
    }
  )
);
