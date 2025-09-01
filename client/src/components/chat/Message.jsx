// components/Message.jsx
const Message = ({
  message,
  index,
  isOwnMessage,
  onEditMessage,
  onDeleteMessage,
  onSendReaction,
}) => {
  return (
    <div
      className={`flex mb-4 ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      <div className="max-w-xs">
        {/* Avatar + name */}
        {!isOwnMessage && (
          <div className="flex items-center space-x-2 mb-1">
            {message.profilePic && (
              <img
                src={message.profilePic}
                alt="avatar"
                className="w-6 h-6 rounded-full"
              />
            )}
            <span className="text-xs text-gray-500 font-medium">
              {message.user} {message.bio && `• ${message.bio}`}
            </span>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwnMessage
              ? "bg-indigo-500 text-white rounded-br-none"
              : "bg-gray-100 text-gray-800 rounded-bl-none"
          }`}
        >
          <p>
            {message.text}{" "}
            {message.edited && (
              <span className="text-xs italic">(edited)</span>
            )}
          </p>
          {message.time && (
            <span
              className={`block text-xs mt-1 ${
                isOwnMessage ? "text-indigo-200" : "text-gray-500"
              }`}
            >
              {message.time}
            </span>
          )}
        </div>

        {/* Edit/Delete buttons */}
        {isOwnMessage && (
          <div className="flex space-x-2 mt-1 justify-end">
            <button
              onClick={() => onEditMessage(message)}
              className="text-xs text-blue-500"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => onDeleteMessage(message.id)}
              className="text-xs text-red-500"
            >
              🗑 Delete
            </button>
          </div>
        )}

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div
            className={`flex space-x-1 mt-1 ${
              isOwnMessage ? "justify-end" : "justify-start"
            }`}
          >
            {message.reactions.map((r, idx) => (
              <span
                key={idx}
                className="text-sm bg-white rounded-full px-1 shadow-sm"
              >
                {r}
              </span>
            ))}
          </div>
        )}

        {/* Reaction buttons */}
        <div
          className={`flex space-x-1 mt-1 ${
            isOwnMessage ? "justify-end" : "justify-start"
          }`}
        >
          {["👍", "😂", "❤️"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSendReaction(index, emoji)}
              className="text-xs bg-white rounded-full p-1 shadow hover:shadow-md transition-all hover:scale-110"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Message;