import { useState } from "react";

const MessageInput = ({ socket, currentUser, onSendMessage }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (onSendMessage(message)) {
      setMessage("");

      // Stop typing event after sending
      if (socket && currentUser?.username) {
        socket.emit("stopTyping", currentUser.username);
      }
    }
  };

  const handleTyping = (e) => {
    const text = e.target.value;
    setMessage(text);

    if (!socket || !currentUser?.username) return;

    if (text.trim()) {
      socket.emit("typing", currentUser.username);
    } else {
      socket.emit("stopTyping", currentUser.username);
    }
  };

  const clearMessage = () => {
    setMessage("");
    if (socket && currentUser?.username) {
      socket.emit("stopTyping", currentUser.username);
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        {/* Input */}
        <div className="flex-1 relative">
          <input
            value={message}
            onChange={handleTyping}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit(e)}
            className="w-full border border-gray-300 rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all pr-16"
            placeholder="Type a message..."
          />
          {message && (
            <button
              type="button"
              onClick={clearMessage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim()}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full w-14 h-14 flex items-center justify-center hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
