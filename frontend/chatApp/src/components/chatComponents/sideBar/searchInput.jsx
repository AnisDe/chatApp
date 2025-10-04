import React from "react";
import "./Sidebar.css"; // or create separate SearchInput.css

const SearchInput = ({ value, onChange }) => {
  return (
    <input
      type="text"
      placeholder="Search by username..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="search-input"
    />
  );
};

export default SearchInput;
