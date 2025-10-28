// hooks/useSocket.js
import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

export const useSocket = (currentUserId) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  const typingTimeoutRef = useRef(null);
  const eventHandlersRef = useRef(new Map());
  //Any existing handlers for the event are removed to avoid duplicates
  const on = useCallback(
    (event, handler) => {
      if (!socket) return;
      const existing = eventHandlersRef.current.get(event) || [];
      existing.forEach((h) => socket.off(event, h));
      socket.on(event, handler);
      eventHandlersRef.current.set(event, [handler]);
    },
    [socket]
  );
  //Removes either a specific handler or all handlers for a given event
  const off = useCallback(
    (event, handler) => {
      if (!socket) return;
      if (handler) socket.off(event, handler);
      else {
        const handlers = eventHandlersRef.current.get(event) || [];
        handlers.forEach((h) => socket.off(event, h));
      }
      eventHandlersRef.current.delete(event);
    },
    [socket]
  );
  // Wrapper to send events only when socket is connected
  const emit = useCallback(
    (event, data) => {
      if (!socket || !isConnected) return;
      socket.emit(event, data);
    },
    [socket, isConnected]
  );
  //Manages typing indicators with a timeout to reset the state
  const startTyping = useCallback(
    ({ to, from }) => {
      emit("typing", { to, from });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        emit("stop_typing", { to, from });
        setTypingUser(null);
      }, 2000);
    },
    [emit]
  );

  //Stops typing indicator immediately when user stops typing
  const stopTyping = useCallback(
    ({ to, from }) => {
      emit("stop_typing", { to, from });
      setTypingUser(null);
    },
    [emit]
  );

  //Establishes socket connection and sets up core event listeners
  useEffect(() => {
    if (!currentUserId) return;
    const s = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    const handleConnect = () => {
      setIsConnected(true);
      s.emit("user_connected", currentUserId);
    };

    const handleDisconnect = () => setIsConnected(false);
    const handleOnlineUsers = (users) => setOnlineUsers(users || []);
    const handleUserTyping = ({ from }) => setTypingUser(from);
    const handleUserStopTyping = () => setTypingUser(null);

    s.on("connect", handleConnect);
    s.on("disconnect", handleDisconnect);
    s.on("online_users", handleOnlineUsers);
    s.on("typing", handleUserTyping);
    s.on("stop_typing", handleUserStopTyping);

    eventHandlersRef.current.clear();
    setSocket(s);

    return () => {
      s.disconnect();
      eventHandlersRef.current.clear();
    };
  }, [currentUserId]);

  return {
    socket,
    onlineUsers,
    typingUser,
    isConnected,
    connectionError,
    on,
    off,
    emit,
    startTyping,
    stopTyping,
  };
};
