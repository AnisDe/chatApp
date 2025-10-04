import React from "react";
import "./Sidebar.css"; // or separate SearchPopup.css

const SearchPopup = ({ users, onUserSelect }) => {
  return (
    <div className="search-popup">
      <div className="popup-header">
        <span>Search Results</span>
      </div>

      {users.length > 0 ? (
        users.map((user) => (
          <button
            key={user._id}
            className="popup-user-item"
            onClick={() => onUserSelect(user)}
          >
            {user.username}
          </button>
        ))
      ) : (
        <div className="popup-no-results">No users found</div>
      )}
    </div>
  );
};

export default SearchPopup;
