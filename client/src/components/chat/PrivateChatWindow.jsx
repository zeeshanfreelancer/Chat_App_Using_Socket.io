import { useState } from "react";

export default function PrivateChatWindow({
  activeChat,
  privateMessages,
  sendPrivateMessage,
  currentUser,
}) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;

    // pass both recipient and message
    sendPrivateMessage(activeChat, message);
    setMessage("");
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a user from the sidebar to start private chat
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-3 bg-indigo-600 text-white flex justify-between items-center">
        <span>Chat with {activeChat}</span>
        <button
          onClick={() => window.location.reload()}
          className="text-sm bg-red-500 px-3 py-1 rounded hover:bg-red-600"
        >
          Close
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {(privateMessages[activeChat] || []).map((m, i) => (
          <div
            key={i}
            className={`mb-2 ${m.from === currentUser ? "text-right" : "text-left"}`}
          >
            <span
              className={`inline-block px-3 py-2 rounded-lg ${
                m.from === currentUser
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <b>{m.from}: </b> {m.text}
            </span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t flex">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder={`Message ${activeChat}...`}
        />
        <button
          onClick={handleSend}
          className="ml-2 bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
