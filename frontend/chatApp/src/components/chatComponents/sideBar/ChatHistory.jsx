import React from "react";
import "./Sidebar.css"; // Keep using Sidebar.css for unified styling

const ChatHistory = ({ chatHistory, currentChatUser, onSelectUser, onlineUsers }) => {
  return (
    <ul className="chat-history-list">
      {chatHistory.map((user) => {
        const isOnline = onlineUsers?.includes(user._id);
        return (
          <li
            key={user._id}
            className={`history-user ${currentChatUser?._id === user._id ? "active" : ""}`}
            onClick={() => onSelectUser(user)}
          >
            <div className="user-avatar">
              {user.username[0].toUpperCase()}
              <span className={`status-dot ${isOnline ? "online-dot" : "offline-dot"}`}></span>
            </div>

            <div className="user-info">
              <span className="username">{user.username}</span>
              <span className="last-message">
                {user.lastMessage || "No messages yet"}
              </span>
            </div>

            {user.lastTimestamp && (
              <span className="timestamp">
                {new Date(user.lastTimestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default ChatHistory;
