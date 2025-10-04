// src/hooks/useSocket.js
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const useSocket = (userId, onMessage) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const socket = io("http://localhost:8000/chat", {
      withCredentials: true
    });

    socket.on("connect", () => {
      console.log("✅ Connected to socket server");
    });

    socket.on("private_message", (msg) => {
      console.log("📩 New private message:", msg);
      if (onMessage) onMessage(msg);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const sendMessage = (to, message) => {
    if (socketRef.current) {
      socketRef.current.emit("private_message", { to, message });
    }
  };

  return { sendMessage };
};

export default useSocket;
