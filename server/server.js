import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import connectDB from "./config/db.js";
import Message from "./models/Message.js";
import authRoutes from "./routes/auth.js";
import User from "./models/User.js"; // <-- Import User model

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Track online users
let onlineUsers = {}; // { username: socketId }

// ✅ Emit all registered users when Sidebar loads
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, "username email"); // only return needed fields
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "❌ Failed to fetch users" });
  }
});

// ✅ Notify sockets when a new user signs up
app.use("/api/auth", (req, res, next) => {
  res.once("finish", async () => {
    if (req.method === "POST" && res.statusCode === 201) {
      try {
        const users = await User.find({}, "username email");
        io.emit("allUsers", users); // 🔹 broadcast updated user list
      } catch (err) {
        console.error("❌ Emit users failed:", err.message);
      }
    }
  });
  next();
}, authRoutes);

io.on("connection", (socket) => {
  const username = socket.handshake.query.username || "Unknown";

  if (username !== "vite-hmr") {
    console.log(`✅ ${username} connected`);
  }

  // 🔹 Register user when joining
  socket.on("joinUser", (username) => {
    onlineUsers[username] = socket.id;
    io.emit("onlineUsers", Object.keys(onlineUsers));
  });

  // 🔹 Private message
  socket.on("privateMessage", ({ to, from, text }) => {
    const targetSocket = onlineUsers[to];
    if (targetSocket) {
      io.to(targetSocket).emit("privateMessage", { from, text });
    }
  });

  // 🔹 Delete message
  socket.on("deleteMessage", async (id) => {
    try {
      await Message.findByIdAndDelete(id);
      io.emit("messageDeleted", id);
    } catch (error) {
      console.error("❌ Delete failed:", error.message);
    }
  });

  // 🔹 Edit message
  socket.on("editMessage", async ({ id, newText }) => {
    try {
      const msg = await Message.findByIdAndUpdate(
        id,
        { text: newText, edited: true },
        { new: true }
      );
      io.emit("messageEdited", msg);
    } catch (error) {
      console.error("❌ Edit failed:", error.message);
    }
  });

  // 🔹 Public chat messages
  socket.on("chatMessage", async (data) => {
    try {
      const newMessage = new Message({
        username: data.username,
        text: data.text,
      });
      await newMessage.save();

      const messageData = {
        _id: newMessage._id,
        username: data.username,
        text: data.text,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        reactions: [],
        edited: false,
      };

      io.emit("chatMessage", messageData);
    } catch (error) {
      console.error("❌ Chat message save failed:", error.message);
    }
  });

  // 🔹 Typing indicator
  socket.on("typing", (username) => {
    socket.broadcast.emit("typing", username);
  });

  socket.on("stopTyping", (username) => {
    socket.broadcast.emit("stopTyping", username);
  });

  // 🔹 Reactions
  socket.on("reactMessage", async ({ id, reaction }) => {
    try {
      const msg = await Message.findById(id);
      if (msg) {
        msg.reactions.push(reaction);
        await msg.save();
        io.emit("reactMessage", { id, reactions: msg.reactions });
      }
    } catch (error) {
      console.error("❌ Reaction failed:", error.message);
    }
  });

  // 🔹 Disconnect
  socket.on("disconnect", () => {
    if (username !== "vite-hmr") {
      console.log(`❌ ${username} disconnected`);
    }

    // Remove from online users
    for (let user in onlineUsers) {
      if (onlineUsers[user] === socket.id) {
        delete onlineUsers[user];
      }
    }
    io.emit("onlineUsers", Object.keys(onlineUsers));
  });
});

const PORT = 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
