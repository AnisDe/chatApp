import React from "react";

const ChatInput = ({ text, setText, onSend }) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSend();
    }
  };

  return (
    <div className="chat-input-wrapper">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message"
        onKeyDown={handleKeyDown}
      />
      <button onClick={onSend} className="send-button">
        Send
      </button>
    </div>
  );
};

export default ChatInput;
