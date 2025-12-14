import React from "react";
import ChatMessages from "./chatMessages";
import ChatInput from "./chatInput";
import "./chatWindow.css";
import { isUserOnline } from "../../../utils/isOnline";

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
            <div className="chat-avatar">
              {otherUser.username?.[0]?.toUpperCase() || "?"}
              <span
                className={`status-dot ${
                  isOnline ? "online-dot" : "offline-dot"
                }`}
              ></span>
            </div>

            <div className="chat-header-text">
              <span className="chat-username">{otherUser.username}</span>
            </div>
          </div>

          {loading && <div className="chat-loading">Loading messages...</div>}
        </div>
      )}

      {/* ✅ Messages section */}
      <div className="messages-section">
        {currentConversation ? (
          <ChatMessages
            messages={messages || []}
            currentUserId={currentUserId}
            currentConversation={currentConversation}
            typingUser={typingUser}
            loading={loading}
          />
        ) : null}
      </div>

      {/* ✅ Input section (only show if a conversation is selected) */}
      {currentConversation && (
        <ChatInput
          text={text}
          setText={setText}
          onSend={onSend}
          onTyping={onTyping}
          stopTyping={stopTyping}
          currentConversation={currentConversation}
          currentUserId={currentUserId}
          disabled={loading}
        />
      )}
    </div>
  );
};

export default ChatWindow;
