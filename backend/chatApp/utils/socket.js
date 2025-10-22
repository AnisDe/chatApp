// utils/socket.js
import { handlePrivateMessage } from "../services/messageService.js";
import userServices from "../services/userService.js";

/**
 * Initialize Socket.IO with session support and private messaging
 * @param {Server} io - Socket.IO server instance
 * @param {function} getUserFromSession - function to extract user ID or username from session
 */
const initSocket = (io, getUserFromSession) => {
  const onlineUsers = new Map();

  io.on("connection", async (socket) => {
    console.log("🟢 New client connected:", socket.id);

    try {
      const username = getUserFromSession(socket.request);
      if (!username) return socket.disconnect();

      const user = await userServices.getUserByUsername(username);
      if (!user) return socket.disconnect();

      const userId = user._id.toString();

      // ✅ Always join the room by user ID
      socket.join(userId);
      onlineUsers.set(userId, true); // just mark as online (no socket.id)
      console.log(`${userId} joined its personal room`);

      io.emit("online_users", Array.from(onlineUsers.keys()));

      // ✅ Handle private messages
      socket.on("private_message", async (payload) => {
        try {
          await handlePrivateMessage(io, socket, payload, user);
        } catch (err) {
          console.error("Private message error:", err);
          socket.emit("error", { message: "Failed to send message" });
        }
      });

      // ✅ Typing events
      socket.on("typing", ({ to, from }) => {
        if (to) io.to(to).emit("user_typing", { from });
      });

      socket.on("stop_typing", ({ to, from }) => {
        if (to) io.to(to).emit("user_stop_typing", { from });
      });

      // ✅ Disconnect cleanup
      socket.on("disconnect", () => {
        onlineUsers.delete(userId);
        io.emit("online_users", Array.from(onlineUsers.keys()));
        console.log(`🔴 ${userId} disconnected`);
      });
    } catch (err) {
      console.error("Socket connection error:", err);
      socket.disconnect();
    }
  });
};

export default initSocket;
