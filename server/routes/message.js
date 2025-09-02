// routes/message.js
import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

// Public messages
router.get("/public", async (req, res) => {
  try {
    const messages = await Message.find({ type: { $ne: "private" } }).populate("user", "username profilePic bio");
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// Private messages between two users
router.get("/private/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    const messages = await Message.find({
      type: "private",
      $or: [
        { user: user1, to: user2 },
        { user: user2, to: user1 },
      ],
    }).populate("user", "username profilePic bio");
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch private messages" });
  }
});

export default router;
