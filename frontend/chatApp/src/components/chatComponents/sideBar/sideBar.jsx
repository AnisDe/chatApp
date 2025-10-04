import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import SearchInput from "./searchInput";
import SearchPopup from "./searchPopup";
import ChatHistory from "./ChatHistory";
import axiosInstance from "../../../lib/axios";

const Sidebar = ({
  users,
  searchTerm,
  onSearchChange,
  onSelectUser,
  currentUserId,
  currentChatUser,
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);

  // Load chat history
  useEffect(() => {
    if (currentUserId) {
      axiosInstance
        .get(`/messages/history/${currentUserId}`)
        .then((res) => setChatHistory(res.data))
        .catch((err) => console.error("Failed to fetch chat history:", err));
    }
  }, [currentUserId]);

  // Filter users based on search term
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
      <h3>Chats</h3>

      <div className="search-container">
        <SearchInput value={searchTerm} onChange={onSearchChange} />
        {showPopup && (
          <SearchPopup
            users={filteredUsers}
            onUserSelect={(user) => {
              onSelectUser(user);
              setShowPopup(false);
              onSearchChange("");
            }}
          />
        )}
      </div>

      <div className="chat-history">
        <ChatHistory
          chatHistory={chatHistory}
          currentChatUser={currentChatUser}
          onSelectUser={onSelectUser}
        />
      </div>
    </div>
  );
};

export default Sidebar;
