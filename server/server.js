import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import connectDB from "./config/db.js";
import Message from "./models/Message.js";
import authRoutes from "./routes/auth.js";
import messageRoutes from "./routes/message.js";
import User from "./models/User.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"], // frontend origin
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  },
});

// Track online users
let onlineUsers = {};

// 🔹 API Routes
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, "username email");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "❌ Failed to fetch users" });
  }
});

// Notify sockets when a new user signs up
app.use(
  "/api/auth",
  (req, res, next) => {
    res.once("finish", async () => {
      if (req.method === "POST" && res.statusCode === 201) {
        try {
          const users = await User.find({}, "username email");
          io.emit("allUsers", users);
        } catch (err) {
          console.error("❌ Emit users failed:", err.message);
        }
      }
    });
    next();
  },
  authRoutes
);

app.use("/api/messages", messageRoutes);

// 🔹 Get all public messages
app.get("/api/messages/public", async (req, res) => {
  try {
    const messages = await Message.find({ type: "public" })
      .populate("user", "username profilePic")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "❌ Failed to fetch public messages" });
  }
});

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

  if (username !== "vite-hmr") {
    console.log(`✅ ${username} connected`);
    onlineUsers[username] = socket.id;
    io.emit("onlineUsers", Object.keys(onlineUsers));
  }
  // Register user when joining
  socket.on("joinUser", (username) => {
    onlineUsers[username] = socket.id;
    io.emit("onlineUsers", Object.keys(onlineUsers));
  });

  // Private message
  socket.on("privateMessage", async ({ to, from, text }) => {
    try {
      const sender = await User.findOne({ username: from });
      const recipient = await User.findOne({ username: to });

      if (!sender || !recipient) {
        console.error("❌ Sender or recipient not found");
        return;
      }

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

      // Send to recipient if online
      const targetSocket = onlineUsers[to];
      if (targetSocket) {
        io.to(targetSocket).emit("privateMessage", messageData);
      }

    } catch (error) {
      console.error("❌ Private message save failed:", error.message);
    }
  });

  // Public chat message
  socket.on("chatMessage", async (data) => {
    try {
      const sender = await User.findOne({ username: data.user });
      if (!sender) return;

      const newMessage = new Message({
        user: sender._id,
        text: data.text,
        type: "public",
      });
      await newMessage.save();

      const messageData = {
        _id: newMessage._id,
        user: sender.username, 
        text: data.text,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      io.emit("chatMessage", messageData);
    } catch (error) {
      console.error("❌ Chat message save failed:", error.message);
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
