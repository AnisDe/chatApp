import React, { useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";

const ChatMessages = ({ messages, currentUserId, currentChatUser }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="chat-messages">
      {messages.map((m, i) => (
        <ChatMessage
          key={i}
          message={m}
          isCurrentUser={m.sender === currentUserId}
          senderName={m.sender === currentUserId ? "You" : currentChatUser.username}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
