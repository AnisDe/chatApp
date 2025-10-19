// utils/isOnline.js
export const isUserOnline = (userId, onlineUsers) => {
  if (!userId || !Array.isArray(onlineUsers)) return false;
  return onlineUsers.includes(userId);
};
