// routes/messages.js
import express from "express";
import Message from "../models/message.js";
import mongoose from "mongoose";
const router = express.Router();

// Get all messages between two users
const getMessages = async (req, res) => {
   const { user1, user2 } = req.query;
  console.log("Fetching messages between:", user1, user2);

  if (!user1 || !user2) {
    return res.status(400).json({ error: "Missing users" });
  }

  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ createdAt: 1 }); // oldest first

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


 const getChatHistory = async (req, res) => {
  const { userId } = req.params;
  try {
    // Get distinct conversation partners and their last message in one query
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: new mongoose.Types.ObjectId(userId) }, { receiver: new mongoose.Types.ObjectId(userId) }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] },
              "$receiver",
              "$sender"
            ]
          },
          lastMessage: { $first: "$message" },
          lastMessageDate: { $first: "$createdAt" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      {
        $unwind: "$userInfo"
      },
      {
        $project: {
          _id: "$userInfo._id",
          username: "$userInfo.username",
          lastMessage: 1,
          lastMessageDate: 1
        }
      },
      {
        $sort: { lastMessageDate: -1 }
      }
    ]);
    
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { getMessages, getChatHistory };
