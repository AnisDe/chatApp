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
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
      setShowPopup(filtered.length > 0);
    }
  }, [searchTerm, users]);

  return (
    <div className="chat-sidebar">
      <div className="search-container">
        <h3 className="sidebar-title">Chats</h3>

        <div className="search-box">
          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            className="search-input"
          />
          <span className="search-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="22"
              height="22"
              viewBox="0 0 50 50"
            >
              <path d="M 21 3 C 11.601563 3 4 10.601563 4 20 C 4 29.398438 11.601563 37 21 37 C 24.355469 37 27.460938 36.015625 30.09375 34.34375 L 42.375 46.625 L 46.625 42.375 L 34.5 30.28125 C 36.679688 27.421875 38 23.878906 38 20 C 38 10.601563 30.398438 3 21 3 Z M 21 7 C 28.199219 7 34 12.800781 34 20 C 34 27.199219 28.199219 33 21 33 C 13.800781 33 8 27.199219 8 20 C 8 12.800781 13.800781 7 21 7 Z"></path>
            </svg>
          </span>
        </div>

        <span className="add-chat-btn">+</span>

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

      <div className="sidebar-divider" />

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
