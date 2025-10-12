// hooks/useSocket.js
import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";
const TOAST_OPTIONS = {
  position: "top-right",
  autoClose: 5000,
  closeOnClick: true,
  pauseOnHover: true,
};

export const useSocket = (currentUserId, currentChatUserRef) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const typingTimeoutRef = useRef(null);
  const eventHandlersRef = useRef(new Map());

  // Initialize socket connection
  useEffect(() => {
    if (!currentUserId) return;

    const s = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    const handleConnect = () => {
      console.log("✅ Socket connected", s.id);
      setIsConnected(true);
      s.emit("user_connected", currentUserId);
    };

    const handleDisconnect = () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    };

    const handleOnlineUsers = (usersOnline) => {
      setOnlineUsers(usersOnline);
    };

    // Typing event handlers
    const handleUserTyping = ({ from }) => {
      if (from !== currentUserId) {
        setTypingUser(from);
      }
    };

    const handleUserStopTyping = ({ from }) => {
      setTypingUser((prev) => (prev === from ? null : prev));
    };

    s.on("connect", handleConnect);
    s.on("disconnect", handleDisconnect);
    s.on("online_users", handleOnlineUsers);
    s.on("user_typing", handleUserTyping);
    s.on("user_stop_typing", handleUserStopTyping);

    setSocket(s);

    return () => {
      s.off("connect", handleConnect);
      s.off("disconnect", handleDisconnect);
      s.off("online_users", handleOnlineUsers);
      s.off("user_typing", handleUserTyping);
      s.off("user_stop_typing", handleUserStopTyping);
      s.disconnect();
    };
  }, [currentUserId]);

  // Register event handler
  const on = useCallback((event, handler) => {
    if (!socket) return;

    // Remove existing handler for this event
    const existingHandlers = eventHandlersRef.current.get(event) || [];
    existingHandlers.forEach(existingHandler => {
      socket.off(event, existingHandler);
    });

    // Add new handler
    socket.on(event, handler);
    eventHandlersRef.current.set(event, [handler]);
  }, [socket]);

  // Remove event handler
  const off = useCallback((event, handler) => {
    if (!socket) return;
    socket.off(event, handler);
    
    const existingHandlers = eventHandlersRef.current.get(event) || [];
    const filteredHandlers = existingHandlers.filter(h => h !== handler);
    eventHandlersRef.current.set(event, filteredHandlers);
  }, [socket]);

  // Emit event
  const emit = useCallback((event, data) => {
    if (!socket) return;
    socket.emit(event, data);
  }, [socket]);

  // Typing handlers
  const startTyping = useCallback(({ to, from }) => {
    if (!socket) return;

    emit("typing", { to, from });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping({ to, from });
    }, 2000);
  }, [socket, emit]);

  const stopTyping = useCallback(({ to, from }) => {
    if (!socket) return;
    emit("stop_typing", { to, from });
  }, [socket, emit]);

  // Clear typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    socket,
    onlineUsers,
    typingUser,
    setTypingUser,
    isConnected,
    on,
    off,
    emit,
    startTyping,
    stopTyping,
  };
};