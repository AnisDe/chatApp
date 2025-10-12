import React from "react";

const ChatInput = ({ text, setText, onSend, onTyping }) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSend();
    }
  };

  return (
    <div className="chat-input-wrapper">
      <input
        id="chat-input"
        type="text"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onTyping(); 
        }}
         onKeyDown={handleKeyDown}
      />

      <button onClick={onSend} className="send-button">
        Send
      </button>
    </div>
  );
};

export default ChatInput;
