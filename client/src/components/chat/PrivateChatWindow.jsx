import { useEffect, useRef } from "react";
import ChatInput from "./ChatInput";

export default function PrivateChatWindow({
  activeChat,
  privateMessages,
  sendPrivateMessage,
  currentUser,
}) {
  const messagesEndRef = useRef(null);

  // 🔹 Auto-scroll to last message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [privateMessages, activeChat]);

  // 🔹 If no user is selected
  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 bg-white rounded-lg m-4">
        <div className="text-center p-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-indigo-300 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p>Select a user from the sidebar to start a private chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-white    ">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {(privateMessages[activeChat] || []).map((m, i) => (
          <div
            key={i}
            className={`mb-4 ${m.from === currentUser ? "text-right" : "text-left"}`}
          >
            <div
              className={`inline-block max-w-xs lg:max-w-md xl:max-w-lg rounded-lg px-4 py-2 ${
                m.from === currentUser
                  ? "bg-indigo-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              <p>{m.text}</p>
              <span
                className={`text-xs block mt-1 ${
                  m.from === currentUser ? "text-indigo-200" : "text-gray-500"
                }`}
              >
                {m.time || new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Component */}
      <ChatInput activeChat={activeChat} onSend={sendPrivateMessage} />
    </div>
  );
}
