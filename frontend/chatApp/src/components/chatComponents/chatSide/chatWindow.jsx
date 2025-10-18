import React from "react";
import ChatMessages from "./chatMessages";
import ChatInput from "./ChatInput";
import "./chatWindow.css";

const ChatWindow = ({
  messages,
  currentUserId,
  currentConversation,
  text,
  setText,
  onSend,
  typingUser,
  onTyping,
}) => {
  // 🧠 Identify the other participant
  const otherUser = currentConversation?.participants?.find(
    (p) => p._id !== currentUserId,
  );

  return (
    <div className="chat-main">
      <>
        {/* ✅ Messages section */}
        <div className="messages-section">
          <ChatMessages
            messages={messages}
            currentUserId={currentUserId}
            currentConversation={currentConversation}
            typingUser={typingUser}
          />
        </div>

        {/* ✅ Input section */}
        <ChatInput
          text={text}
          setText={setText}
          onSend={onSend}
          onTyping={onTyping}
        />
      </>
    </div>
  );
};

export default ChatWindow;
