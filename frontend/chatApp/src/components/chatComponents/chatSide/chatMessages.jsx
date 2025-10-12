import React, { useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";

const ChatMessages = ({
  messages,
  currentUserId,
  currentChatUser,
  typingUser,
}) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  return (
    <div className="chat-messages">
      {messages.map((m, i) => (
        <ChatMessage
          key={i}
          message={m}
          isCurrentUser={m.sender === currentUserId}
          senderName={
            m.sender === currentUserId ? "You" : currentChatUser.username
          }
        />
      ))}

      {/* ✅ Typing indicator bubble */}
      {typingUser === currentChatUser?._id && (
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
