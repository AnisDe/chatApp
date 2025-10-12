// components/Chat.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import axiosInstance from "../../lib/axios";
import Sidebar from "./sideBar/sideBar";
import ChatWindow from "./chatSide/chatWindow";
import "react-toastify/dist/ReactToastify.css";
import "./chatPage.css";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";
const TOAST_OPTIONS = { position: "top-right", autoClose: 5000, closeOnClick: true, pauseOnHover: true };

const Chat = ({ currentUserId }) => {
  const [socket, setSocket] = useState(null);
  const [currentChatUser, setCurrentChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);

  const currentChatUserRef = useRef(currentChatUser);
  useEffect(() => {
    currentChatUserRef.current = currentChatUser;
  }, [currentChatUser]);

  /** ---------------------------
   *  Utility: Update Chat History
   * --------------------------- */
  const updateChatHistory = useCallback((userId, username, message) => {
    setChatHistory((prev) => {
      const updated = [...prev];
      const idx = updated.findIndex((u) => u._id === userId);
      const entry = {
        _id: userId,
        username,
        lastMessage: message,
        lastTimestamp: new Date().toISOString(),
      };
      if (idx !== -1) updated[idx] = entry;
      else updated.unshift(entry);
      return updated.sort((a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp));
    });
  }, []);

  /** ---------------------------
   *  Load Chat History (once)
   * --------------------------- */
  useEffect(() => {
    if (!currentUserId) return;
    axiosInstance
      .get(`/messages/history/${currentUserId}`)
      .then((res) => {
        const sorted = res.data.sort((a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp));
        setChatHistory(sorted);
      })
      .catch((err) => console.error("Failed to fetch chat history:", err));
  }, [currentUserId]);

  /** ---------------------------
   *  SOCKET SETUP
   * --------------------------- */
  useEffect(() => {
    if (!currentUserId) return;

    const socketInstance = io(SOCKET_URL, { withCredentials: true, transports: ["websocket", "polling"] });
    setSocket(socketInstance);

    socketInstance.on("connect", () => console.log("✅ Socket connected:", socketInstance.id));
    socketInstance.emit("user_connected", currentUserId);

    socketInstance.on("online_users", (usersOnline) => setOnlineUsers(usersOnline));

    // Incoming private message
    socketInstance.on("private_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      updateChatHistory(msg.sender, msg.fromUsername || "Unknown", msg.message);
    });

    // Notification
    socketInstance.on("notification", ({ sender, messagePreview, fromUsername }) => {
      const activeChat = currentChatUserRef.current;
      if (!activeChat || activeChat._id !== sender) {
        toast.info(`New message from ${fromUsername}: ${messagePreview}`, {
          ...TOAST_OPTIONS,
          onClick: () => handleSelectUser({ _id: sender, username: fromUsername }),
        });
      }
    });

    return () => socketInstance.disconnect();
  }, [currentUserId, updateChatHistory]);

  /** ---------------------------
   *  Fetch Messages for Selected User
   * --------------------------- */
  const handleSelectUser = useCallback(async (user) => {
    setCurrentChatUser(user);
    setMessages([]);
    try {
      const res = await axiosInstance.get("/messages", {
        params: { user1: currentUserId, user2: user._id },
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  }, [currentUserId]);

  /** ---------------------------
   *  Send Message
   * --------------------------- */
  const handleSend = useCallback(() => {
    if (!text.trim() || !currentChatUser) return;

    socket.emit("private_message", { to: currentChatUser._id, message: text });

    const newMessage = {
      sender: currentUserId,
      receiver: currentChatUser._id,
      message: text,
    };

    setMessages((prev) => [...prev, newMessage]);
    updateChatHistory(currentChatUser._id, currentChatUser.username, text);
    setText("");
  }, [socket, text, currentChatUser, currentUserId, updateChatHistory]);

  /** ---------------------------
   *  Search Users
   * --------------------------- */
  useEffect(() => {
    if (!searchTerm.trim()) return setUsers([]);

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/user/search", { params: { username: searchTerm } });
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchTerm]);

  /** ---------------------------
   *  JSX
   * --------------------------- */
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
      />

      <ChatWindow
        messages={messages}
        currentUserId={currentUserId}
        currentChatUser={currentChatUser}
        text={text}
        setText={setText}
        onSend={handleSend}
      />
    </div>
  );
};

export default Chat;
