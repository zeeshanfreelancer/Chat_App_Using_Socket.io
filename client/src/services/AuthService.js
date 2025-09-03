// src/services/AuthService.js
import axios from "axios";
import { io } from "socket.io-client";

const API_URL = "http://localhost:5000/api/auth";
const SOCKET_URL = "http://localhost:5000";

let socket = null;

// Connect or get the socket instance
export const connectSocket = (username) => {
  if (!username) return null;

  // Return existing socket if already connected
  if (socket) {
    // Update auth username in case user refreshed
    socket.auth = { username };
    if (!socket.connected) socket.connect();
    return socket;
  }

  // Create new socket
  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    auth: { username },
    autoConnect: true,
    reconnection: true,       
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,       
    reconnectionDelayMax: 5000,  
  });

  socket.on("connect", () => {
    console.log("🔗 Connected to WebSocket:", socket.id);
    socket.emit("joinUser", username);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("⚠️ Socket connection error:", err.message);
  });

  return socket;
};

// Register
export const register = async (userData) => {
  const res = await axios.post(`${API_URL}/register`, userData);
  if (res.data?.user) {
    localStorage.setItem("user", JSON.stringify(res.data.user));
    connectSocket(res.data.user.username);
  }
  return res.data;
};

// Login
export const login = async (userData) => {
  const res = await axios.post(`${API_URL}/login`, userData);
  if (res.data?.user) {
    localStorage.setItem("user", JSON.stringify(res.data.user));
    connectSocket(res.data.user.username);
  }
  return res.data;
};

// Logout
export const logout = () => {
  const user = getCurrentUser();
  if (user && socket) {
    socket.emit("userOffline", user.username);
    socket.disconnect();
    socket = null;
  }
  localStorage.removeItem("user");
};

// Get current user
export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

// Get socket instance
export const getSocket = () => socket;
