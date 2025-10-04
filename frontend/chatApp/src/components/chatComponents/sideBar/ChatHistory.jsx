import React from "react";
import "./Sidebar.css"; // Optional: separate CSS or reuse Sidebar.css

const ChatHistory = ({ chatHistory, currentChatUser, onSelectUser }) => {
  if (!chatHistory || chatHistory.length === 0) {
    return <p className="no-history">No chats yet</p>;
  }

  return (
    <ul className="chat-history-list">
      {chatHistory.map((user) => (
        <li
          key={user._id}
          className={`history-user ${
            currentChatUser?._id === user._id ? "active" : ""
          }`}
          onClick={() => onSelectUser(user)}
        >
          <div className="user-avatar">{user.username[0].toUpperCase()}</div>
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
      ))}
    </ul>
  );
};

export default ChatHistory;
