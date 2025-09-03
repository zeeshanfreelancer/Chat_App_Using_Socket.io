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

export default router;
