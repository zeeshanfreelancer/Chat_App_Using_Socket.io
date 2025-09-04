import { useState, useRef } from "react";

export default function ChatInput({ activeChat, onSend }) {
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(activeChat, message);
    setMessage("");
    inputRef.current?.focus();
  };

  return (
    <div className="sticky bottom-0 z-50 p-4 border-t flex items-center bg-white rounded-b-lg">
      <input
        ref={inputRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        className="flex-1 border rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        placeholder={`Message ${activeChat}...`}
      />
      <button
        onClick={handleSend}
        className="ml-2 bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
      >
        ➤
      </button>
    </div>
  );
}
