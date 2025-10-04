// components/Chat.jsx
import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import axiosInstance from "../../lib/axios";
import Sidebar from "./sideBar/sideBar";
import ChatWindow from "./chatSide/chatWindow";
import "react-toastify/dist/ReactToastify.css";
import "./chatPage.css";

const Chat = ({ currentUserId }) => {
  const [socket, setSocket] = useState(null);
  const [currentChatUser, setCurrentChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const currentChatUserRef = useRef(currentChatUser);

  useEffect(() => {
    currentChatUserRef.current = currentChatUser;
  }, [currentChatUser]);

  useEffect(() => {
    if (!currentUserId) return;

    const s = io("http://localhost:8000", {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    s.on("connect", () => console.log("Socket connected", s.id));

    s.on("private_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    s.on("notification", (data) => {
      const { sender, messagePreview, fromUsername } = data;
      const chatUser = currentChatUserRef.current;
      if (!chatUser || chatUser._id !== sender) {
        toast.info(`New message from ${fromUsername}: ${messagePreview}`, {
          position: "top-right",
          autoClose: 5000,
          closeOnClick: true,
          pauseOnHover: true,
          onClick: () => selectUserFromNotification(data.from, fromUsername),
        });
      }
    });

    setSocket(s);
    return () => s.disconnect();
  }, [currentUserId]);

  const handleSelectUser = async (user) => {
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
  };

  const selectUserFromNotification = async (userId, username) => {
    const user = { _id: userId, username };
    setCurrentChatUser(user);
    setMessages([]);

    try {
      const res = await axiosInstance.get("/messages", {
        params: { user1: currentUserId, user2: userId },
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  const handleSend = () => {
    if (!text.trim() || !currentChatUser) return;

    socket.emit("private_message", {
      to: currentChatUser._id,
      message: text,
    });

    setMessages((prev) => [
      ...prev,
      { sender: currentUserId, receiver: currentChatUser._id, message: text },
    ]);

    setText("");
  };

  useEffect(() => {
    if (!searchTerm.trim()) return setUsers([]);

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/user/search", {
          params: { username: searchTerm },
        });
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch {
        setUsers([]);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [searchTerm]);

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
        loading={loading}
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
