import React from "react";
import "./Sidebar.css";
import axiosInstance from "../../../lib/axios";
import { isUserOnline } from "../../../utils/isOnline";
import { useConversationManager } from "../../../hooks/useConversationManager";
import { useQueryClient } from "@tanstack/react-query";

const ChatHistory = ({
  chatHistory,
  currentConversation,
  currentUserId,
  onSelectConversation,
  onlineUsers,
}) => {
  const queryClient = useQueryClient(); // ✅ get React Query client safely
  const { clearCurrentConversation, refetchChatHistory } =
    useConversationManager(currentUserId);

  const handleDeleteConversation = async (conversationId, e) => {
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this conversation?"))
      return;

    try {
      const res = await axiosInstance.delete(
        `/messages/conversation/${conversationId}`
      );

      if (res.status === 200) {
        // ✅ Update cached chat history
        queryClient.setQueryData(["chatHistory", currentUserId], (old = []) =>
          old.filter((conv) => conv._id !== conversationId)
        );

        // ✅ Clear open conversation if needed
        if (currentConversation?._id === conversationId)
          clearCurrentConversation();

        // Optional sync with backend
        refetchChatHistory?.();
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
      alert("Failed to delete conversation");
    }
  };

  return (
    <ul className="chat-history-list">
      {chatHistory.map((conv) => {
        const otherUser = conv.participants?.find(
          (p) => p._id !== currentUserId
        );
        const isOnline = isUserOnline(otherUser?._id, onlineUsers);
        const lastMsg = conv.lastMessage?.message || "No messages yet";
        const lastTime = conv.lastMessageAt
          ? new Date(conv.lastMessageAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "";

        return (
          <li
            key={conv._id}
            className={`history-user ${
              currentConversation?._id === conv._id ? "active" : ""
            }`}
            onClick={() => onSelectConversation(conv)}
          >
            <div className="user-avatar">
              {otherUser?.username?.[0]?.toUpperCase() || "?"}
              <span
                className={`status-dot ${
                  isOnline ? "online-dot" : "offline-dot"
                }`}
              ></span>
            </div>

            <div className="user-info">
              <span className="username">
                {otherUser?.username || "Unknown"}
              </span>
              <span className="last-message">{lastMsg}</span>
            </div>

            {lastTime && <span className="timestamp">{lastTime}</span>}

            <button
              className="delete-btn"
              onClick={(e) => handleDeleteConversation(conv._id, e)}
            >
              🗑
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export default ChatHistory;
