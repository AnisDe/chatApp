import User from "../models/user.js";

 const getUserByUsername = async (username) => {
  return User.findOne({ username }).exec();
};

 const getUserByEmail = async (email) => {
  return User.findOne({ email }).exec();
};

 const getUserByUsernameOrEmail = async (identifier) => {
  return User.findOne({
    $or: [{ username: identifier }, { email: identifier }],
  }).exec();
};

 const checkExistingUser = async (username, email) => {
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    const usernameTaken = existingUser.username === username;
    const emailTaken = existingUser.email === email;

    let message = "";
    if (usernameTaken && emailTaken) {
      message = "Username and email are already taken.";
    } else if (usernameTaken) {
      message = "Username is already taken.";
    } else if (emailTaken) {
      message = "Email is already registered.";
    }
    return { exists: true, message };
  }
};

export default { getUserByUsername, getUserByEmail, getUserByUsernameOrEmail, checkExistingUser };