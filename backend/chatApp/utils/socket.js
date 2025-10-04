// utils/socket.js
import { handlePrivateMessage } from "../services/messageService.js";
import userServices  from "../services/userService.js";

/**
 * Initialize Socket.IO with session support and private messaging
 * @param {Server} io - Socket.IO server instance
 * @param {function} getUserFromSession - function to extract user ID from session
 */
const initSocket = (io, getUserFromSession) => {
  io.on("connection", async (socket) => {
    try {
      const username = getUserFromSession(socket.request);
      if (!username) return socket.disconnect();

      const user = await userServices.getUserByUsername(username);
      if (!user) return socket.disconnect();

      const userId = user._id.toString();
      socket.join(userId);

      // Pass the user object to the handler
      socket.on("private_message", async (payload) => {
        try {
          await handlePrivateMessage(io, socket, payload, user);
        } catch (err) {
          console.error(err);
          socket.emit("error", { message: "Failed to send message" });
        }
      });

      socket.on("disconnect", () => console.info(`User disconnected: ${username}`));
    } catch (err) {
      console.error("Socket connection error:", err);
      socket.disconnect();
    }
  });
};

export default initSocket;
