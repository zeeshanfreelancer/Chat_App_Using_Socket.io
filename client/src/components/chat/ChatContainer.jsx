import { useEffect, useRef, useState } from "react";
import Header from "./Header";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import SidebarToggle from "./SidebarToggle";
import PrivateChatWindow from "./PrivateChatWindow";

const ChatContainer = ({ user, socket, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // For private chat
  const [privateMessages, setPrivateMessages] = useState({});
  const messagesEndRef = useRef(null);

  // Join socket
  useEffect(() => {
    if (user?.username) {
      socket.emit("joinUser", user.username);
    }
  }, [user, socket]);

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col h-[90vh] max-h-[700px] relative">
        
        {/* Sidebar Toggle */}
        <SidebarToggle
          socket={socket}
          onlineUsers={onlineUsers}
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          currentUser={user.username}
        />

        {/* Main Chat UI */}
        <Header user={user} onLogout={onLogout} />

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

        <PrivateChatWindow
          activeChat={activeChat}
          privateMessages={privateMessages}
          sendPrivateMessage={sendPrivateMessage}
          currentUser={user.username}
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
    </div>
  );
};

export default ChatContainer;
