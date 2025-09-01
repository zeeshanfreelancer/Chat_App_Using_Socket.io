import { useEffect, useState } from "react";
import SidebarToggle from "./SidebarToggle";
import PrivateChatWindow from "./PrivateChatWindow";

export default function PrivateChatContainer({ user, socket }) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [privateMessages, setPrivateMessages] = useState({});

  useEffect(() => {
    if (!user?.username) return;

    socket.emit("joinUser", user.username);

    socket.on("onlineUsers", (users) => setOnlineUsers(users));

    socket.on("privateMessage", ({ from, text }) => {
      setPrivateMessages((prev) => ({
        ...prev,
        [from]: [...(prev[from] || []), { from, text }],
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

  // ✅ now accepts two args
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
        { from: user.username, text: message },
      ],
    }));
  };

  return (
    <div className="flex h-screen bg-gray-100 relative">
      <SidebarToggle
        socket={socket} // ✅ Add this - socket is needed in SidebarToggle
        onlineUsers={onlineUsers} // ✅ Pass the onlineUsers from state
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        currentUser={user.username}
      />

      <PrivateChatWindow
        activeChat={activeChat}
        privateMessages={privateMessages}
        sendPrivateMessage={sendPrivateMessage} // ✅ pass two-arg function
        currentUser={user.username}
      />
    </div>
  );
}
