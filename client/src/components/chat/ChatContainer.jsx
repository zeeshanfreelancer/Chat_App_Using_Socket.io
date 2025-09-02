import { useEffect, useRef, useState } from "react";
import Header from "./Header";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import PrivateChatWindow from "./PrivateChatWindow";

const ChatContainer = ({ user, socket, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // For private chat
  const [privateMessages, setPrivateMessages] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Join socket
  useEffect(() => {
    if (user?.username) {
      socket.emit("joinUser", user.username);
    }
  }, [user, socket]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/messages/public");
        const data = await res.json();

        // Transform messages to ensure user is a string for older messages
        const transformed = data.map(msg => ({
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



  // Auto scroll to last message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);


  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    // Public chat
    socket.on("chatMessage", (msg) => setMessages((prev) => [...prev, msg]));

    socket.on("typing", (username) => {
      if (username !== user?.username) setTypingUser(username);
    });

    socket.on("stopTyping", (username) => {
      if (username === typingUser) setTypingUser(null);
    });

    socket.on("reactMessage", ({ index, reaction }) => {
      setMessages((prev) =>
        prev.map((msg, i) =>
          i === index ? { ...msg, reactions: [...(msg.reactions || []), reaction] } : msg
        )
      );
    });

    socket.on("messageDeleted", (id) => setMessages((prev) => prev.filter((m) => m.id !== id)));

    socket.on("messageEdited", (editedMsg) =>
      setMessages((prev) => prev.map((m) => (m.id === editedMsg.id ? editedMsg : m)))
    );

    // Online users
    socket.on("onlineUsers", (users) => setOnlineUsers(users));

    // Private messages
    socket.on("privateMessage", ({ from, text }) => {
      setPrivateMessages((prev) => ({
        ...prev,
        [from]: [...(prev[from] || []), { from, text }],
      }));
    });

    return () => {
      socket.off();
    };
  }, [socket, user, typingUser]);

  const sendPrivateMessage = (recipient, message) => {
    if (!message.trim() || !recipient) return;

    socket.emit("privateMessage", {
      to: recipient,
      from: user.username,
      text: message,
    });

    setPrivateMessages((prev) => ({
      ...prev,
      [recipient]: [...(prev[recipient] || []), { from: user.username, text: message }],
    }));
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden">
      {/* Sidebar */}
      <div className={`bg-white shadow-xl transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
        <div className="p-4 font-bold text-lg border-b">Online Users</div>
        <div className="p-2 overflow-y-auto h-[calc(100vh-4rem)]">
          {onlineUsers.filter(u => u !== user.username).map((user) => (
            <div
              key={user}
              onClick={() => {
                setActiveChat(user);
                setSidebarOpen(false);
              }}
              className="p-3 cursor-pointer hover:bg-indigo-100 rounded-lg flex items-center"
            >
              <span className="text-green-500 mr-2">●</span>
              {user}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        <Header user={user} onLogout={onLogout} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Public Chat */}
          <div className={`flex-1 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
            <MessageList
              messages={messages}
              currentUser={user}
              typingUser={typingUser}
              messagesEndRef={messagesEndRef}
              onEditMessage={(msg) => {
                const newText = prompt("Edit message:", msg.text);
                if (newText && newText !== msg.text) socket.emit("editMessage", { id: msg.id, newText });
              }}
              onDeleteMessage={(id) => socket.emit("deleteMessage", id)}
              onSendReaction={(index, reaction) => socket.emit("reactMessage", { index, reaction })}
            />
            <MessageInput
              socket={socket}
              currentUser={user}
              onSendMessage={(messageText) => {
                if (messageText.trim() && user) {
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
                }
                return false;
              }}
            />
          </div>

          {/* Private Chat */}
          <div className={`flex-1 flex flex-col ${activeChat ? 'flex' : 'hidden md:flex'} border-l border-gray-200`}>
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