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

  const allUsers = Array.from(new Set([...users, ...onlineUsers]));

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors z-50 flex items-center space-x-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span>{isOpen ? "Close" : "Users"}</span>
      </button>

      {isOpen && (
        <div className="fixed top-0 left-0 w-80 h-full bg-white border-r shadow-2xl z-40 overflow-y-auto transform transition-transform duration-300">
          <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg">
            Users ({allUsers.length})
          </div>

          <div className="p-3">
            {allUsers.length > 0 ? (
              allUsers.map((u) => (
                <div
                  key={u}
                  onClick={() => {
                    if (u !== currentUser) {
                      setActiveChat(u);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3 cursor-pointer rounded-lg mb-2 transition-all hover:shadow-md ${
                    activeChat === u 
                      ? "bg-indigo-100 border-l-4 border-indigo-500" 
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="font-medium">{u}</span>
                      {u === currentUser && (
                        <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {onlineUsers.includes(u) ? "Online" : "Offline"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p>No users found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}