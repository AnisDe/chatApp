// store/chatStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useChatStore = create(
  persist(
    (set, get) => ({
      // --- Messages ---
      messages: [],
      setMessages: (msgs) => set({ messages: msgs }),

      addMessage: (msg) => {
        if (!msg) return;

        const existing = get().messages;

        // Prevent duplicate by _id
        const existsById = existing.some((m) => m._id && m._id === msg._id);
        if (existsById) return;

        // Remove temp message if same content and very close timestamps
        const filteredExisting = existing.filter((existingMsg) => {
          if (
            existingMsg.isTemp &&
            existingMsg.message === msg.message &&
            Math.abs(
              new Date(existingMsg.createdAt) - new Date(msg.createdAt)
            ) < 5000
          ) {
            return false;
          }
          return true;
        });

        // Sort by creation date
        const updated = [...filteredExisting, msg].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        set({ messages: updated });
      },

      clearMessages: () => set({ messages: [] }),

      // --- Conversation ---
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
