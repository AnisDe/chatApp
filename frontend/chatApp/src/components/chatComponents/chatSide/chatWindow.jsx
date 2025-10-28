import React from "react";
import ChatMessages from "./chatMessages";
import ChatInput from "./chatInput";
import "./chatWindow.css";
import { isUserOnline } from "../../../utils/isOnline"; // adjust the path

const ChatWindow = ({
  currentUserId,
  currentConversation,
  messages,
  text,
  setText,
  onSend,
  stopTyping,
  typingUser,
  onTyping,
  onlineUsers,
  loading = false,
}) => {
  // Identify the other participant
  const otherUser = currentConversation?.participants?.find(
    (p) => p._id !== currentUserId
  );
  const isOnline = isUserOnline(otherUser?._id, onlineUsers);

  return (
    <div className="chat-main">
      {/* ✅ Chat header */}
      {otherUser && (
        <div className="chat-header">
          <div className="chat-header-info">
            {/* Avatar */}
            <div className="chat-avatar">
              {otherUser.username?.[0]?.toUpperCase() || "?"}
              <span
                className={`status-dot ${
                  isOnline ? "online-dot" : "offline-dot"
                }`}
              ></span>
            </div>

            {/* Username + status */}
            <div className="chat-header-text">
              <span className="chat-username">{otherUser.username}</span>
            </div>
          </div>

          {/* Optional loading indicator */}
          {loading && <div className="chat-loading">Loading messages...</div>}
        </div>
      )}

      {/* ✅ Messages section */}
      <div className="messages-section">
        <ChatMessages
          messages={messages || []} // 👈 Use messages from props
          currentUserId={currentUserId}
          currentConversation={currentConversation}
          typingUser={typingUser}
          loading={loading}
        />
      </div>

      {/* ✅ Input section */}
      <ChatInput
        text={text}
        setText={setText}
        onSend={onSend}
        onTyping={onTyping}
        stopTyping={stopTyping}
        currentConversation={currentConversation}
        currentUserId={currentUserId}
        disabled={!currentConversation || loading}
      />
    </div>
  );
};

export default ChatWindow;
