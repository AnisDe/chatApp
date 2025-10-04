import React from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import "./chatWindow.css";

const ChatWindow = ({ messages, currentUserId, currentChatUser, text, setText, onSend }) => {
  return (
    <div className="chat-main">
      {currentChatUser ? (
        <>
          <ChatMessages
            messages={messages}
            currentUserId={currentUserId}
            currentChatUser={currentChatUser}
          />
          <ChatInput
            text={text}
            setText={setText}
            onSend={onSend}
          />
        </>
      ) : (
        <div className="chat-placeholder">{null}</div>
      )}
    </div>
  );
};

export default ChatWindow;
