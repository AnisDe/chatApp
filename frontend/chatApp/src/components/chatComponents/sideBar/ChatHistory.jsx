import React from "react";
import "./Sidebar.css";
import axiosInstance from "../../../lib/axios";

const ChatHistory = ({
  chatHistory,
  currentConversation,
  currentUserId,
  onSelectConversation,
  onlineUsers,
  setChatHistory,
}) => {
  const handleDeleteConversation = async (conversationId, e) => {
    e.stopPropagation(); // Prevent opening the chat when clicking delete
    if (!window.confirm("Are you sure you want to delete this conversation?"))
      return;

    try {
      await axiosInstance.delete(`/messages/conversation/${conversationId}`);
      setChatHistory((prev) =>
        prev.filter((conv) => conv._id !== conversationId)
      );
    } catch (err) {
      console.error("Failed to delete conversation:", err);
      alert("Failed to delete conversation");
    }
  };

  return (
    <ul className="chat-history-list">
      {chatHistory.map((conv) => {
        const otherUser = conv.participants.find(
          (p) => p._id !== currentUserId
        );
        const isOnline = onlineUsers?.includes(otherUser?._id);
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

            {/* 🗑 Always mounted; visibility handled by CSS */}
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
