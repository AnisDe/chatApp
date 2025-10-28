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

      {/* Typing indicator bubble */}
      {typingUser && otherUser && typingUser === otherUser._id && (
        <div className="message received typing-bubble">
          <div className="dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
