import express from "express";
import User from "../models/User.js"; 

const router = express.Router();

/**
 * @route   GET /api/users?search=<query>
 * @desc    Search users by username (case-insensitive)
 * @access  Public / Protected (you decide)
 */

 
// Save chat partner
router.post("/save-chat", async (req, res) => {
  try {
    const { currentUser, partner } = req.body;

    const user = await User.findOne({ username: currentUser });
    const partnerUser = await User.findOne({ username: partner });

    if (!user || !partnerUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add partner if not already saved
    if (!user.chats.includes(partnerUser._id)) {
      user.chats.push(partnerUser._id);
      await user.save();
    }

    res.json({ message: "Chat partner saved" });
  } catch (err) {
    res.status(500).json({ message: "Failed to save chat partner" });
  }
});

// Get saved chat list
router.get("/chats/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).populate(
      "chats",
      "username profilePic"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.chats);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch chats" });
  }
});

router.get("/", async (req, res) => {
  try {
    const search = req.query.search || "";

    // 🔹 If no search query, return empty (or all users if you want)
    if (!search.trim()) {
      return res.json([]);
    }

    // 🔹 Find users whose username matches (case-insensitive regex)
    const users = await User.find({
      username: { $regex: search, $options: "i" },
    }).select("_id username"); // select only what you need

    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
