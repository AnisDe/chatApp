import React from "react";

const ChatMessage = ({ message, isCurrentUser, senderName }) => {
  return (
    <div className={`chat-message ${isCurrentUser ? "user" : "other"}`}>
      <b>{senderName}:</b> {message.message}
    </div>
  );
};

export default ChatMessage;
