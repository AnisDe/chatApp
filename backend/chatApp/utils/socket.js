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

      // ✅ Always join the room by user ID
      socket.join(userId);
      onlineUsers.set(userId, true);

      console.log(
        `✅ User ${username} (${userId}) connected with socket ${socket.id}`
      );
      io.emit("online_users", Array.from(onlineUsers.keys()));

      // ✅ NEW: Handle joining conversation rooms
      socket.on("join_conversation", (conversationId) => {
        socket.join(conversationId);
        console.log(
          `🚪 Socket ${socket.id} (${username}) joined conversation room: ${conversationId}`
        );

        // Optional: Log room size
        const room = io.sockets.adapter.rooms.get(conversationId);
        console.log(
          `📊 Room ${conversationId} now has ${room ? room.size : 0} members`
        );
      });

      // ✅ Handle private messages
      socket.on("private_message", async (payload) => {
        try {
          await handlePrivateMessage(io, socket, payload, user);
        } catch (err) {
          console.error("Private message error:", err);
          socket.emit("error", { message: "Failed to send message" });
        }
      });

      // ✅ FIXED: Typing events with correct event names
      socket.on("typing", ({ to, from }) => {
        console.log(`⌨️ Typing event: from ${from} to room ${to}`);
        if (to) {
          // Broadcast to everyone in the room EXCEPT the sender
          socket.to(to).emit("typing", { from }); // ✅ Changed event name
        }
      });

      socket.on("stop_typing", ({ to, from }) => {
        console.log(`🛑 Stop typing: from ${from} to room ${to}`);
        if (to) {
          socket.to(to).emit("stop_typing", { from }); // ✅ Changed event name
        }
      });

      // ✅ Disconnect cleanup
      socket.on("disconnect", () => {
        console.log(`❌ User ${username} (${userId}) disconnected`);
        onlineUsers.delete(userId);
        io.emit("online_users", Array.from(onlineUsers.keys()));
      });
    } catch (err) {
      console.error("Socket connection error:", err);
      socket.disconnect();
    }
  });
};

export default initSocket;
