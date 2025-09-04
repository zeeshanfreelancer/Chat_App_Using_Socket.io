import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import messageRoutes from "./routes/message.js";
import userRoutes from "./routes/user.js";
import Message from "./models/Message.js";
import User from "./models/User.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB();

// Create HTTP + Socket server
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Track online users
let onlineUsers = {};

// 🔹 Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// 🔹 Get private messages between two users
app.get("/api/messages/private/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    const u1 = await User.findOne({ username: user1 });
    const u2 = await User.findOne({ username: user2 });

    if (!u1 || !u2) return res.status(404).json({ message: "User not found" });

    const messages = await Message.find({
      type: "private",
      $or: [
        { user: u1._id, to: u2._id },
        { user: u2._id, to: u1._id },
      ],
    })
      .populate("user", "username profilePic bio")
      .populate("to", "username")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "❌ Failed to fetch private messages" });
  }
});

// 🔹 Socket.IO events
io.on("connection", (socket) => {
  let username = socket.handshake.auth.username;

  if (username && username !== "vite-hmr") {
    console.log(`✅ ${username} connected`);
    onlineUsers[username] = socket.id;
    io.emit("onlineUsers", Object.keys(onlineUsers));
  }

  // Join user
  socket.on("joinUser", (username) => {
    onlineUsers[username] = socket.id;
    io.emit("onlineUsers", Object.keys(onlineUsers));
  });

  // Private message
  socket.on("privateMessage", async ({ to, from, text }) => {
    try {
      const sender = await User.findOne({ username: from });
      const recipient = await User.findOne({ username: to });

      if (!sender || !recipient) return;

      const newMessage = new Message({
        user: sender._id,
        to: recipient._id,
        text,
        type: "private",
      });

      await newMessage.save();

      const messageData = {
        _id: newMessage._id,
        from,
        to,
        text,
        type: "private",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      const targetSocket = onlineUsers[to];
      if (targetSocket) {
        io.to(targetSocket).emit("privateMessage", messageData);
      }
    } catch (error) {
      console.error("❌ Private message save failed:", error.message);
    }
  });

  // Typing indicator
  socket.on("typing", (username) => {
    socket.broadcast.emit("typing", username);
  });

  socket.on("stopTyping", (username) => {
    socket.broadcast.emit("stopTyping", username);
  });

  // Disconnect
  socket.on("disconnect", () => {
    if (username && username !== "vite-hmr") {
      console.log(`❌ ${username} disconnected`);
      delete onlineUsers[username];
      io.emit("onlineUsers", Object.keys(onlineUsers));
    }
  });
});

const PORT = 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);