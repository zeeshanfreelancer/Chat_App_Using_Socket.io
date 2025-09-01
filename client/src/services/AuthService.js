// src/services/AuthService.js
import axios from "axios";
import io from "socket.io-client";

const API_URL = "http://localhost:5000/api/auth"; // Change if deployed
const SOCKET_URL = "http://localhost:5000"; // Socket server URL

// Create a single socket connection
export const socket = io(SOCKET_URL, { autoConnect: false });

export const register = async (userData) => {
  const res = await axios.post(`${API_URL}/register`, userData);

  if (res.data?.user) {
    // store user in localStorage
    localStorage.setItem("user", JSON.stringify(res.data.user));

    // connect to socket and emit "joinUser"
    socket.connect();
    socket.emit("joinUser", res.data.user.username);
  }

  return res.data;
};

export const login = async (userData) => {
  const res = await axios.post(`${API_URL}/login`, userData);

  if (res.data?.user) {
    localStorage.setItem("user", JSON.stringify(res.data.user));

    socket.connect();
    socket.emit("joinUser", res.data.user.username);
  }

  return res.data;
};

export const logout = () => {
  const user = getCurrentUser();
  if (user) {
    socket.emit("userOffline", user.username);
  }

  localStorage.removeItem("user");
  socket.disconnect();
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};
