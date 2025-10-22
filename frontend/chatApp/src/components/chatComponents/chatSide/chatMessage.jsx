// components/chatSide/ChatMessage.jsx
import React from "react";

const ChatMessage = ({ message, isCurrentUser, senderName }) => {
  const hasImages = message.images && message.images.length > 0;

  return (
    <div className={`chat-message ${isCurrentUser ? "user" : "other"}`}>
      <b>{senderName}:</b> {message.message}

      {hasImages && (
        <div className="message-images">
          {message.images.map((img, index) => {
            // ✅ Support both { url } and plain string
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
  );
};

export default ChatMessage;
