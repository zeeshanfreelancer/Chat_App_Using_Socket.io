import { useEffect, useState } from "react";
import Header from "./Header";
import PrivateChatWindow from "./PrivateChatWindow";
import SidebarToggle from "./SidebarToggle";

const ChatContainer = ({ user, socket, onLogout }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [privateMessages, setPrivateMessages] = useState({});

  // Join socket + listeners
  useEffect(() => {
    if (!user?.username || !socket) return;

    socket.emit("joinUser", user.username);

    socket.on("onlineUsers", (users) => setOnlineUsers(users));

    socket.on("privateMessage", ({ from, to, text, time }) => {
      const chatKey = from === user.username ? to : from;
      setPrivateMessages((prev) => ({
        ...prev,
        [chatKey]: [...(prev[chatKey] || []), { from, to, text, time }],
      }));
    });

    return () => {
      socket.off("onlineUsers");
      socket.off("privateMessage");
    };
  }, [socket, user]);

  // Fetch private history when switching chats
  useEffect(() => {
    if (!activeChat || !user?.username) return;

    const fetchPrivate = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/messages/private/${user.username}/${activeChat}`
        );
        const data = await res.json();

        const transformed = data.map((msg) => ({
          from: msg.user?.username || msg.user,
          to: msg.to?.username,
          text: msg.text,
          profilePic: msg.user?.profilePic,
          bio: msg.user?.bio,
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

        setPrivateMessages((prev) => ({ ...prev, [activeChat]: transformed }));
      } catch (err) {
        console.error("❌ Failed to fetch private messages", err);
      }
    };

    fetchPrivate();
  }, [activeChat, user?.username]);

  // Send private message
  const sendPrivateMessage = (recipient, message) => {
    if (!message.trim() || !recipient || !socket) return;

    socket.emit("privateMessage", {
      to: recipient,
      from: user.username,
      text: message,
    });

    const newMsg = {
      from: user.username,
      to: recipient,
      text: message,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setPrivateMessages((prev) => ({
      ...prev,
      [recipient]: [...(prev[recipient] || []), newMsg],
    }));
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden">
      {/* Sidebar always visible with fixed width */}
      <SidebarToggle
        socket={socket}
        onlineUsers={onlineUsers}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        currentUser={user.username}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        <Header user={user} onLogout={onLogout} activeChat={activeChat} />

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
};

export default ChatContainer;
