import { useState, useEffect } from "react";
import axios from "axios";

export default function SidebarToggle({
  socket,
  onlineUsers = [],
  activeChat,
  setActiveChat,
  currentUser,
}) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatList, setChatList] = useState([]); // 🔹 saved chats
  const [notifications, setNotifications] = useState({}); // 🔹 { username: count }

  // 🔹 Fetch users from DB (search)
  useEffect(() => {
    const fetchUsers = async () => {
      if (search.trim() === "") {
        setUsers([]);
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:5000/api/users?search=${search}`
        );

        // Filter out current user
        const data = Array.isArray(res.data) ? res.data : res.data.users || [];
        const filtered = data.filter((u) => u.username !== currentUser);

        setUsers(filtered);
      } catch (err) {
        console.error("Error fetching users:", err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(fetchUsers, 500); // debounce typing
    return () => clearTimeout(delayDebounce);
  }, [search, currentUser]);

  // Fetch saved chats on mount
useEffect(() => {
  const fetchChats = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/users/chats/${currentUser}`
      );
      setChatList(res.data);
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  };
  fetchChats();
}, [currentUser]);


  // 🔹 Listen for incoming private messages
  useEffect(() => {
    if (!socket) return;

    const handlePrivateMessage = (msg) => {
      const sender = msg.from;
      if (sender !== currentUser) {
        // Add to chat list if new
        setChatList((prev) => {
          if (!prev.find((u) => u.username === sender)) {
            return [...prev, { username: sender }];
          }
          return prev;
        });

        // Increase notification count if not in active chat
        if (activeChat !== sender) {
          setNotifications((prev) => ({
            ...prev,
            [sender]: (prev[sender] || 0) + 1,
          }));
        }
      }
    };

    socket.on("privateMessage", handlePrivateMessage);
    return () => socket.off("privateMessage", handlePrivateMessage);
  }, [socket, activeChat, currentUser]);

  // 🔹 Start chat with a user
const handleChatStart = async (u) => {
  setActiveChat(u.username);

  // Save in DB
  try {
    await axios.post("http://localhost:5000/api/users/save-chat", {
      currentUser,
      partner: u.username,
    });
  } catch (err) {
    console.error("Error saving chat partner:", err);
  }

  // Save in sidebar
  setChatList((prev) => {
    if (!prev.find((user) => user.username === u.username)) {
      return [...prev, u];
    }
    return prev;
  });

  // Clear notifications
  setNotifications((prev) => {
    const copy = { ...prev };
    delete copy[u.username];
    return copy;
  });
};


  return (
    <div className="sticky top-0 z-50 w-64 h-full bg-white border-r shadow-lg flex flex-col">
      {/* Search Bar */}
      <div className="p-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search users..."
          className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Users List */}
      <div className="p-3 flex-1 overflow-y-auto">
        {/* 🔹 Show saved chats first */}
        {chatList.map((u) => (
          <div
            key={u._id || u.username}
            onClick={() => handleChatStart(u)}
            className={`p-3 cursor-pointer rounded-lg mb-2 transition-all hover:shadow-md ${
              activeChat === u.username
                ? "bg-indigo-100 border-l-4 border-indigo-500"
                : "hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    onlineUsers.includes(u.username)
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                ></div>
                <span className="font-medium">{u.username}</span>
              </div>

              {/* 🔹 Notification badge */}
              {notifications[u.username] && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {notifications[u.username]}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* 🔹 Search results */}
        {search && !loading && users.length > 0 && (
          <>
            <p className="text-xs text-gray-400 mb-2">Search Results</p>
            {users.map((u) => (
              <div
                key={u._id || u.username}
                onClick={() => handleChatStart(u)}
                className={`p-3 cursor-pointer rounded-lg mb-2 transition-all hover:shadow-md ${
                  activeChat === u.username
                    ? "bg-indigo-100 border-l-4 border-indigo-500"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        onlineUsers.includes(u.username)
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <span className="font-medium">{u.username}</span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {loading && <p className="text-center text-gray-400">Searching...</p>}
        {!loading && search && users.length === 0 && (
          <p className="text-center text-gray-400">No users found</p>
        )}
      </div>
    </div>
  );
}
