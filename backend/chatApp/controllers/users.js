import "dotenv/config";
import User from "../models/user.js";

// EDIT USER
const editUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { username, email } = req.body;

    if (!username || username.trim() === "")
      return res.status(400).json({ message: "Username is empty" });

    if (!email || email.trim() === "")
      return res.status(400).json({ message: "Email is empty" });

    user.username = username.trim();
    user.email = email.trim();

    await user.save();

    res.json({ user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already in use" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// GET PROFILE
const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    console.log(user);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE USER
const DeleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or already deleted" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



const searchUser = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res
        .status(400)
        .json({ message: "Username query parameter is required." });
    }

    const users = await User.find({
      username: { $regex: username, $options: "i" }, // Case-insensitive search
    }).select("username email"); // Select only necessary fields
    console.log(users);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// EXPORT ALL
export default {

  editUser,
  profile,
  DeleteUser,
  searchUser,
};
