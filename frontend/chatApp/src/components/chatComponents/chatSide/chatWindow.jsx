import React from "react";
import ChatMessages from "./chatMessages";
import ChatInput from "./ChatInput";
import "./chatWindow.css";
import { isUserOnline } from "../../../utils/isOnline"; // adjust the path

const ChatWindow = ({
  messages,
  currentUserId,
  currentConversation,
  text,
  setText,
  onSend,
  typingUser,
  onTyping,  onlineUsers, // 👈 added prop
}) => {
  // Identify the other participant
  const otherUser = currentConversation?.participants?.find(
    (p) => p._id !== currentUserId
  );

  // Check if the other user is online
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
        </div>
      )}


      {/* ✅ Messages section */}
      <div className="messages-section">
        <ChatMessages
          messages={messages}
          currentUserId={currentUserId}
          currentConversation={currentConversation}
          typingUser={typingUser}
        />
      </div>

      {/* ✅ Input section */}
      <ChatInput
        text={text}
        setText={setText}
        onSend={onSend}
        onTyping={onTyping}
      />
    </div>
  );
};

export default ChatWindow;
