import Message from "./Message";

const MessageList = ({
  messages,
  currentUser,
  typingUser,
  messagesEndRef,
  onEditMessage,
  onDeleteMessage,
  onSendReaction,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white to-indigo-50">
      <div className="max-w-4xl mx-auto">
        {messages.map((msg, i) => (
          <Message
            key={msg._id || msg.id}
            message={msg}
            index={i}
            isOwnMessage={
              // Check if msg.user is an object or string
              msg.user?.username === currentUser.username ||
              msg.user === currentUser.username
            }
            onEditMessage={onEditMessage}
            onDeleteMessage={onDeleteMessage}
            onSendReaction={onSendReaction}
          />
        ))}

        {/* Typing Indicator */}
        {typingUser && (
          <div className="flex items-center text-sm text-gray-500 italic mb-4 ml-4">
            <div className="typing-dots flex space-x-1 mr-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
            {typingUser} is typing...
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
