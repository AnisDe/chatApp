// components/Chat.jsx
import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import Sidebar from "./sideBar/sideBar";
import ChatWindow from "./chatSide/chatWindow";
import { useChat } from "../../hooks/useChat";
import "react-toastify/dist/ReactToastify.css";
import "./chatPage.css";

const Chat = ({ currentUserId }) => {
  const [text, setText] = useState("");

  const {
    // ✅ State
    currentConversation,
    messages,
    users,
    searchTerm,
    loading,
    onlineUsers,
    chatHistory,
    typingUser,
    isConnected,
    setChatHistory, // ✅ make sure this is here

    // ✅ Actions
    handleSelectConversation,
    handleSend: sendMessage,
    handleTyping,
    setSearchTerm,
  } = useChat(currentUserId);

  const handleSend = () => {
    if (text.trim()) {
      sendMessage(text);
      setText("");
    }
  };

  const handleInputTyping = () => {
    handleTyping();
  };

  return (
    <div className="chat-container">
      <ToastContainer />

      <Sidebar
        users={users}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSelectConversation={handleSelectConversation}
        currentUserId={currentUserId}
        currentConversation={currentConversation}
        onlineUsers={onlineUsers}
        loading={loading}
        chatHistory={chatHistory}
        setChatHistory={setChatHistory} // ✅ no more ReferenceError
        connectionStatus={isConnected ? "connected" : "disconnected"}
      />

      <ChatWindow
        messages={messages}
        currentUserId={currentUserId}
        currentConversation={currentConversation}
        text={text}
        setText={setText}
        onSend={handleSend}
        onTyping={handleInputTyping}
        typingUser={typingUser}
        connectionStatus={isConnected ? "connected" : "disconnected"}
        onlineUsers={onlineUsers}
      />
    </div>
  );
};

export default Chat;
