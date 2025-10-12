// components/Chat.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import axiosInstance from "../../lib/axios";
import Sidebar from "./sideBar/sideBar";
import ChatWindow from "./chatSide/chatWindow";
import { useChatStore } from "../../store/chatStore";
import "react-toastify/dist/ReactToastify.css";
import "./chatPage.css";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";
const TOAST_OPTIONS = {
  position: "top-right",
  autoClose: 5000,
  closeOnClick: true,
  pauseOnHover: true,
};

const Chat = ({ currentUserId }) => {
  const [socket, setSocket] = useState(null);
  const { currentChatUser, setCurrentChatUser } = useChatStore();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);

  const [typingUser, setTypingUser] = useState(null);
  const typingTimeoutRef = useRef(null);

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
      return updated.sort(
        (a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp),
      );
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
        const sorted = res.data.sort(
          (a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp),
        );
        setChatHistory(sorted);
      })
      .catch((err) => console.error("Failed to fetch chat history:", err));
  }, [currentUserId]);

  useEffect(() => {
    if (currentChatUser && currentUserId) {
      // Automatically reload last messages
      axiosInstance
        .get("/messages", {
          params: { user1: currentUserId, user2: currentChatUser._id },
        })
        .then((res) => setMessages(res.data))
        .catch((err) => console.error("Failed to restore chat:", err));
    }
  }, [currentUserId, currentChatUser]);
  /** ---------------------------
   *  SOCKET SETUP
   * --------------------------- */
  useEffect(() => {
    if (!currentUserId) return;

    const s = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    s.on("connect", () => {
      console.log("✅ Socket connected", s.id);
      s.emit("user_connected", currentUserId);
    });

    s.on("disconnect", () => console.log("❌ Socket disconnected"));
    s.on("online_users", (usersOnline) => setOnlineUsers(usersOnline));

    // 🔹 Receive messages
    s.on("private_message", (msg) => {
      setMessages((prev) => [...prev, msg]);

      // ✅ Update chat history instantly
      setChatHistory((prev) => {
        const updated = [...prev];
        const senderId = msg.sender._id || msg.sender;
        const senderName = msg.sender.username || msg.fromUsername || "Unknown";
        const index = updated.findIndex((u) => u._id === senderId);
        const now = new Date().toISOString();

        if (index !== -1) {
          const [user] = updated.splice(index, 1);
          user.lastMessage = msg.message;
          user.lastTimestamp = now;
          updated.unshift(user);
        } else {
          updated.unshift({
            _id: senderId,
            username: senderName,
            lastMessage: msg.message,
            lastTimestamp: now,
          });
        }
        return updated;
      });
    });

    // 🔹 Notifications
    s.on("notification", (data) => {
      const { sender, messagePreview, fromUsername } = data;
      const chatUser = currentChatUserRef.current;
      if (!chatUser || chatUser._id !== sender) {
        toast.info(`New message from ${fromUsername}: ${messagePreview}`, {
          ...TOAST_OPTIONS,
          onClick: () => selectUserFromNotification(data.from, fromUsername),
        });
      }
    });

    // 🔹 Typing events
    s.on("user_typing", ({ from }) => {
      if (from !== currentUserId) setTypingUser(from);
    });

    s.on("user_stop_typing", ({ from }) => {
      setTypingUser((prev) => (prev === from ? null : prev));
    });

    setSocket(s);
    return () => s.disconnect();
  }, [currentUserId]);

  /** ---------------------------
   *  Fetch Messages for Selected User
   * --------------------------- */
  const handleSelectUser = useCallback(
    async (user) => {
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
    },
    [currentUserId],
  );

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
    socket.emit("stop_typing", {
      to: currentChatUser._id,
      from: currentUserId,
    });
    setTypingUser(null);
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

    fetchUsers();
  }, [searchTerm]);

  // ================= HANDLE TYPING =================
  const handleTyping = () => {
    if (!socket || !currentChatUser) return;

    socket.emit("typing", { to: currentChatUser._id, from: currentUserId });

    // clear previous timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // wait 2s of inactivity before stopping
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", {
        to: currentChatUser._id,
        from: currentUserId,
      });
    }, 2000);
  };

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
        onTyping={handleTyping}
        typingUser={typingUser}
      />
    </div>
  );
};

export default Chat;
