import { useEffect, useState } from "react";
import PrivateChatWindow from "./PrivateChatWindow";

export default function PrivateChatContainer({ user, socket }) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [privateMessages, setPrivateMessages] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user?.username) return;

    socket.emit("joinUser", user.username);

    socket.on("onlineUsers", (users) => setOnlineUsers(users));

    socket.on("privateMessage", ({ from, text }) => {
      setPrivateMessages((prev) => ({
        ...prev,
        [from]: [...(prev[from] || []), { from, text, time: new Date().toLocaleTimeString() }],
      }));
    });

    socket.on("newUserAdded", (newUser) => {
      setOnlineUsers((prev) =>
        prev.includes(newUser) ? prev : [...prev, newUser]
      );
    });

    return () => {
      socket.off("onlineUsers");
      socket.off("privateMessage");
      socket.off("newUserAdded");
    };
  }, [socket, user]);

  useEffect(() => {
    if (!activeChat) return;

    const fetchPrivate = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/messages/private/${user.username}/${activeChat}`
        );
        const data = await res.json();
        const transformed = data.map(msg => ({
          ...msg,
          user: msg.user?.username || msg.user,
          profilePic: msg.user?.profilePic,
          bio: msg.user?.bio,
        }));
        setPrivateMessages(prev => ({ ...prev, [activeChat]: transformed }));
      } catch (err) {
        console.error("❌ Failed to fetch private messages", err);
      }
    };

    fetchPrivate();
  }, [activeChat]);



  const sendPrivateMessage = (recipient, message) => {
    if (!message.trim() || !recipient) return;

    socket.emit("privateMessage", {
      to: recipient,
      from: user.username,
      text: message,
    });

    setPrivateMessages((prev) => ({
      ...prev,
      [recipient]: [
        ...(prev[recipient] || []),
        { 
          from: user.username, 
          text: message, 
          time: new Date().toLocaleTimeString() 
        },
      ],
    }));
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden">
      {/* Sidebar */}
      <div className={`bg-white shadow-xl transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
        <div className="p-4 font-bold text-lg border-b border-gray-200">Online Users</div>
        <div className="p-3 overflow-y-auto h-[calc(100vh-4rem)]">
          {onlineUsers.filter(u => u !== user.username).map((user) => (
            <div
              key={user}
              onClick={() => {
                setActiveChat(user);
                setSidebarOpen(false);
              }}
              className={`p-3 cursor-pointer hover:bg-indigo-50 rounded-lg flex items-center transition-colors ${
                activeChat === user ? 'bg-indigo-100 border-l-4 border-indigo-500' : ''
              }`}
            >
              <span className="text-green-500 mr-3">●</span>
              <span className="font-medium">{user}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-3">
              {user.profilePic && (
                <img
                  src={user.profilePic}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <div>
                <h2 className="text-xl font-bold">💬 Private Chat</h2>
                <p className="text-sm opacity-90">Connected as {user.username}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <PrivateChatWindow
          activeChat={activeChat}
          privateMessages={privateMessages}
          sendPrivateMessage={sendPrivateMessage}
          currentUser={user.username}
          onClose={() => setActiveChat(null)}
        />
      </div>
    </div>
  );
}