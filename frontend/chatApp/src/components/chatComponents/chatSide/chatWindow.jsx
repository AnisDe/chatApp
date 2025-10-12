import React from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import "./chatWindow.css";

const ChatWindow = ({
  messages,
  currentUserId,
  currentChatUser,
  text,
  setText,
  onSend,
  typingUser,
  onTyping,
}) => {
  return (
    <div className="chat-main">
      {currentChatUser ? (
        <>
          <div className="messages-section">
            <ChatMessages
              messages={messages}
              currentUserId={currentUserId}
              currentChatUser={currentChatUser}
              typingUser={typingUser}
            />
          </div>

          <ChatInput
            text={text}
            setText={setText}
            onSend={onSend}
            onTyping={onTyping}
          />
        </>
      ) : null}
    </div>
  );
};

export default ChatWindow;
