// hooks/useUserSearch.js
import { useState, useEffect } from "react";
import axiosInstance from "../lib/axios";

export const useUserSearch = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setUsers([]);
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/user/search", {
          params: { username: searchTerm },
        });
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  return {
    users,
    searchTerm,
    setSearchTerm,
    loading,
  };
};