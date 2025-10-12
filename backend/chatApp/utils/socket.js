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
    try {
      const username = getUserFromSession(socket.request);
      if (!username) return socket.disconnect();

      const user = await userServices.getUserByUsername(username);
      if (!user) return socket.disconnect();

      const userId = user._id.toString();
      socket.join(userId);

      // ✅ Track online users
      onlineUsers.set(userId, socket.id);
      io.emit("online_users", Array.from(onlineUsers.keys()));

      // ✅ Handle private messaging
      socket.on("private_message", async (payload) => {
        try {
          await handlePrivateMessage(io, socket, payload, user);
        } catch (err) {
          console.error("Private message error:", err);
          socket.emit("error", { message: "Failed to send message" });
        }
      });

      // ✅ Handle disconnect
      socket.on("disconnect", () => {
       

        for (let [id, sId] of onlineUsers.entries()) {
          if (sId === socket.id) {
            onlineUsers.delete(id);
            break;
          }
        }

        io.emit("online_users", Array.from(onlineUsers.keys()));
    
      });
    } catch (err) {
      console.error("Socket connection error:", err);
      socket.disconnect();
    }
  });
};

export default initSocket;
