// components/chatSide/ChatMessage.jsx
import React from "react";

const ChatMessage = ({ message, isCurrentUser, senderName }) => {
  const hasImages = message.images && message.images.length > 0;

  return (
    <div
      className={`chat-message ${isCurrentUser ? "user" : "other"}`}
      data-time={new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}
    >
      {/* Bubble */}
      <div className="message-bubble">
        <span className="message-text">{message.message}</span>

        {hasImages && (
          <div className="message-images">
            {message.images.map((img, index) => {
              const src = typeof img === "string" ? img : img.url;
              return (
                <img
                  key={index}
                  src={src}
                  alt={`attachment-${index}`}
                  className="chat-image"
                  loading="lazy"
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
