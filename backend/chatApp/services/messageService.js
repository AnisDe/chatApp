import Message from "../models/message.js";

export const handlePrivateMessage = async (io, socket, { to, message }, senderUser) => {
  if (!to || !message) throw new Error("Invalid message payload");

  const from = senderUser._id.toString();

  await Message.create({ sender: from, receiver: to, message });

  io.to(to).emit("private_message", { from, message });
  io.to(to).emit("notification", {
    from,
    fromUsername: senderUser.username,
    messagePreview: message.substring(0, 50),
  });
};
