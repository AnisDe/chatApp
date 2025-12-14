import React, { useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";

const ChatMessages = ({
  messages,
  currentUserId,
  currentConversation,
  typingUser,
}) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  // Find the other participant for display names
  const otherUser = currentConversation?.participants?.find(
    (p) => p._id !== currentUserId
  );

  // Debug: Check if typing indicator should show
  console.log("Typing user:", typingUser);
  console.log("Other user ID:", otherUser?._id);
  console.log(
    "Should show typing:",
    typingUser && otherUser && typingUser === otherUser._id
  );

  return (
    <div className="chat-messages">
      {messages.map((m, i) => {
        const isCurrentUser =
          m.sender?._id === currentUserId || m.sender === currentUserId;
        const senderName = isCurrentUser
          ? "You"
          : m.sender?.username || otherUser?.username || "Unknown";

        return (
          <ChatMessage
            key={i}
            message={m}
            isCurrentUser={isCurrentUser}
            senderName={senderName}
          />
        );
      })}

      {/* Typing indicator - Fixed structure */}
      {/* Typing indicator - Only show if it's the OTHER user typing */}
      {typingUser &&
        otherUser &&
        typingUser === otherUser._id &&
        typingUser !== currentUserId && ( // ✅ Extra safety check
          <div className="chat-message other">
            <div className="message-avatar">
              {otherUser.username?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="typing-bubble">
              <div className="dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
