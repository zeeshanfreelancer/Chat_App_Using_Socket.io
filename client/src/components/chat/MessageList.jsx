// components/MessageList.jsx
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
    <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-white to-indigo-50">
      {messages.map((msg, i) => (
        <Message
          key={msg.id}
          message={msg}
          index={i}
          isOwnMessage={msg.user === currentUser.username}
          onEditMessage={onEditMessage}
          onDeleteMessage={onDeleteMessage}
          onSendReaction={onSendReaction}
        />
      ))}

      {/* Typing Indicator */}
      {typingUser && (
        <div className="flex items-center text-sm text-gray-500 italic mb-2">
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          {typingUser} is typing...
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;