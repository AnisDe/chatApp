// components/Chat.jsx
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import Sidebar from "./sideBar/sideBar";
import ChatWindow from "./chatSide/chatWindow";
import { useChat } from "../../hooks/useChat";
import "react-toastify/dist/ReactToastify.css";
import "./chatPage.css";

const Chat = ({ currentUserId }) => {
  const [text, setText] = useState("");
  
  const {
    // State
    currentChatUser,
    messages,
    users,
    searchTerm,
    loading,
    onlineUsers,
    chatHistory,
    typingUser,
    isConnected,
    
    // Actions
    handleSelectUser,
    handleSend: sendMessage,
    handleTyping,
    setSearchTerm,
  } = useChat(currentUserId);

  // Enhanced send handler
  const handleSend = () => {
    if (text.trim()) {
      sendMessage(text);
      setText("");
    }
  };

  // Enhanced typing handler
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
        onSelectUser={handleSelectUser}
        currentUserId={currentUserId}
        currentChatUser={currentChatUser}
        onlineUsers={onlineUsers}
        loading={loading}
        chatHistory={chatHistory}
        connectionStatus={isConnected ? "connected" : "disconnected"}
      />

      <ChatWindow
        messages={messages}
        currentUserId={currentUserId}
        currentChatUser={currentChatUser}
        text={text}
        setText={setText}
        onSend={handleSend}
        onTyping={handleInputTyping}
        typingUser={typingUser}
        connectionStatus={isConnected ? "connected" : "disconnected"}
      />
    </div>
  );
};

export default Chat;