// components/sideBar/Sidebar.jsx
import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import SearchInput from "./searchInput";
import SearchPopup from "./searchPopup";
import ChatHistory from "./ChatHistory";

const Sidebar = ({
  users,
  searchTerm,
  onSearchChange,
  onSelectConversation,
  currentUserId,
  currentConversation,
  onlineUsers,
  loading,
  chatHistory,
  setChatHistory,
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // ✅ Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers([]);
      setShowPopup(false);
    } else {
      const filtered = users.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredUsers(filtered);
      setShowPopup(filtered.length > 0);
    }
  }, [searchTerm, users]);

  return (
    <div className="chat-sidebar">
      <h3>Chats</h3>

      <div className="search-container">
        <SearchInput value={searchTerm} onChange={onSearchChange} />

        {showPopup && (
          <SearchPopup
            users={filteredUsers}
            onUserSelect={(user) => {
              onSelectConversation(user);
              setShowPopup(false);
              onSearchChange("");
            }}
          />
        )}
      </div>

      <div className="chat-history">
        <ChatHistory
          chatHistory={chatHistory}
          currentConversation={currentConversation}
          currentUserId={currentUserId}
          onSelectConversation={onSelectConversation}
          onlineUsers={onlineUsers}
          setChatHistory={setChatHistory} 
        />
      </div>
    </div>
  );
};

export default Sidebar;
