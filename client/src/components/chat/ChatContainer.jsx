import { useEffect, useRef, useState } from "react";
import Header from "./Header";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import PrivateChatWindow from "./PrivateChatWindow";

const ChatContainer = ({ user, socket, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // username of the private chat target
  const [privateMessages, setPrivateMessages] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Join socket
  useEffect(() => {
    if (socket && user?.username) {
      socket.emit("joinUser", user.username);
    }
  }, [user, socket]);

  // Fetch public messages once
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/messages/public");
        const data = await res.json();

        // Transform messages to normalize user
        const transformed = data.map((msg) => ({
          ...msg,
          user: msg.user?.username || msg.user,
          profilePic: msg.user?.profilePic,
          bio: msg.user?.bio,
        }));

        setMessages(transformed);
      } catch (error) {
        console.error("❌ Failed to load messages", error);
      }
    };

    fetchMessages();
  }, []);

  // Fetch private messages whenever activeChat changes
  useEffect(() => {
    const fetchPrivateMessages = async () => {
      if (!activeChat || !user?.username) return;
      try {
        const res = await fetch(
          `http://localhost:5000/api/messages/private/${user.username}/${activeChat}`
        );
        const data = await res.json();

        const transformed = data.map((msg) => ({
          from: msg.user?.username,
          to: msg.to?.username,
          text: msg.text,
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

        setPrivateMessages((prev) => ({
          ...prev,
          [activeChat]: transformed,
        }));
      } catch (err) {
        console.error("❌ Failed to load private messages", err);
      }
    };

    fetchPrivateMessages();
  }, [activeChat, user]);

  // Auto scroll to last message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleChatMessage = (msg) => setMessages((prev) => [...prev, msg]);

    const handleTyping = (username) => {
      if (username !== user?.username) setTypingUser(username);
    };

    const handleStopTyping = (username) => {
      if (username === typingUser) setTypingUser(null);
    };

    const handleOnlineUsers = (users) => setOnlineUsers(users);

    const handlePrivateMessage = ({ from, to, text, time }) => {
      const chatKey = from === user.username ? to : from;
      setPrivateMessages((prev) => ({
        ...prev,
        [chatKey]: [...(prev[chatKey] || []), { from, to, text, time }],
      }));
    };

    socket.on("chatMessage", handleChatMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    socket.on("onlineUsers", handleOnlineUsers);
    socket.on("privateMessage", handlePrivateMessage);

    return () => {
      socket.off("chatMessage", handleChatMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("onlineUsers", handleOnlineUsers);
      socket.off("privateMessage", handlePrivateMessage);
    };
  }, [socket, user, typingUser]);

  const sendPrivateMessage = (recipient, message) => {
    if (!message.trim() || !recipient) return;

    socket.emit("privateMessage", {
      to: recipient,
      from: user.username,
      text: message,
    });

    const newMsg = {
      from: user.username,
      to: recipient,
      text: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setPrivateMessages((prev) => ({
      ...prev,
      [recipient]: [...(prev[recipient] || []), newMsg],
    }));
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`bg-white shadow-xl transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-64" : "w-0"
        } overflow-hidden`}
      >
        <div className="p-4 font-bold text-lg border-b">Online Users</div>
        <div className="p-2 overflow-y-auto h-[calc(100vh-4rem)]">
          {onlineUsers
            .filter((u) => u !== user.username)
            .map((u) => (
              <div
                key={u}
                onClick={() => {
                  setActiveChat(u);
                  setSidebarOpen(false);
                }}
                className="p-3 cursor-pointer hover:bg-indigo-100 rounded-lg flex items-center"
              >
                <span className="text-green-500 mr-2">●</span>
                {u}
              </div>
            ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        <Header
          user={user}
          onLogout={onLogout}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Public Chat */}
          <div
            className={`flex-1 flex flex-col ${
              activeChat ? "hidden md:flex" : "flex"
            }`}
          >
            <MessageList
              messages={messages}
              currentUser={user}
              typingUser={typingUser}
              messagesEndRef={messagesEndRef}
            />
            <MessageInput
              socket={socket}
              currentUser={user}
              onSendMessage={(messageText) => {
                if (!socket || !messageText.trim() || !user) return false;

                const msg = {
                  id: Date.now(),
                  user: user.username,
                  text: messageText,
                  profilePic: user.profilePic,
                  bio: user.bio,
                  time: new Date().toLocaleTimeString(),
                };

                socket.emit("chatMessage", msg);
                socket.emit("stopTyping", user.username);

                return true;
              }}
            />
          </div>

          {/* Private Chat */}
          <div
            className={`flex-1 flex flex-col ${
              activeChat ? "flex" : "hidden md:flex"
            } border-l border-gray-200`}
          >
            <PrivateChatWindow
              activeChat={activeChat}
              privateMessages={privateMessages}
              sendPrivateMessage={sendPrivateMessage}
              currentUser={user.username}
              onClose={() => setActiveChat(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
