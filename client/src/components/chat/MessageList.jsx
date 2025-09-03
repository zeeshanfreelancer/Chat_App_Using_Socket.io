import Message from "./Message";

const MessageList = ({
  messages,
  currentUser,
  typingUser,
  messagesEndRef,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white to-indigo-50">
      <div className="max-w-4xl mx-auto">
        {messages.map((msg, i) => (
          <Message
            key={msg._id || msg.id || i} // fallback key if _id/id missing
            message={msg}
            index={i}
            isOwnMessage={
              msg.user?.username === currentUser.username ||
              msg.user === currentUser.username
            }
          />
        ))}

        {/* Typing Indicator */}
        {typingUser && (
          <div className="flex items-center text-sm text-gray-500 italic mb-4 ml-4">
            <div className="typing-dots flex space-x-1 mr-2">
              {[0, 0.2, 0.4].map((delay, idx) => (
                <div
                  key={idx}
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${delay}s` }}
                ></div>
              ))}
            </div>
            <span>{typingUser} is typing...</span>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
