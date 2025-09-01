import { useState, useEffect } from "react";
import axios from "axios";

export default function SidebarToggle({
  socket,
  onlineUsers = [],
  activeChat,
  setActiveChat,
  currentUser,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);

  // Fetch all registered users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users");
        setUsers(res.data.map((u) => u.username));
      } catch (err) {
        console.error("❌ Failed to fetch users:", err.message);
      }
    };
    fetchUsers();
  }, []);

  // Listen for newly registered users
  useEffect(() => {
    if (!socket) return;

    const handleUserRegistered = (newUser) => {
      setUsers((prev) =>
        prev.includes(newUser) ? prev : [...prev, newUser]
      );
    };

    socket.on("userRegistered", handleUserRegistered);
    return () => socket.off("userRegistered", handleUserRegistered);
  }, [socket]);

  const allUsers = Array.from(new Set(users));

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-3 left-3 bg-indigo-600 text-white px-3 py-1 rounded z-50"
      >
        {isOpen ? "Close Users" : "Show Users"}
      </button>

      {isOpen && (
        <div className="absolute top-0 left-0 w-64 h-full bg-white border-r shadow-lg z-40 overflow-y-auto">
          <div className="p-3 font-bold text-lg border-b">Users</div>

          {allUsers.length > 0 ? (
            allUsers.map((u) => (
              <div
                key={u}
                onClick={() => {
                  if (u !== currentUser) {
                    setActiveChat(u); // Open private chat
                    setIsOpen(false);
                  }
                }}
                className={`p-2 cursor-pointer hover:bg-indigo-100 ${
                  activeChat === u ? "bg-indigo-200" : ""
                }`}
              >
                {u} {u === currentUser && "(You)"}{" "}
                {onlineUsers.includes(u) ? (
                  <span className="text-green-500 ml-1">●</span>
                ) : (
                  <span className="text-gray-400 ml-1">●</span>
                )}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500">No users found</div>
          )}
        </div>
      )}
    </>
  );
}
