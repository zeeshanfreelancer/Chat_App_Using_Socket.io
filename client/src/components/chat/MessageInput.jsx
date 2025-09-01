// components/MessageInput.jsx
import { useState } from "react";

const MessageInput = ({ socket, currentUser, onSendMessage }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSendMessage(message)) {
      setMessage("");
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (e.target.value.trim()) {
      socket.emit("typing", currentUser.username);
    } else {
      socket.emit("stopTyping", currentUser.username);
    }
  };

  return (
    <div className="p-3 border-t bg-white">
      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          value={message}
          onChange={handleTyping}
          className="flex-1 border rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="ml-2 bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
        >
          ➤
        </button>
      </form>
    </div>
  );
};

export default MessageInput;