const Message = ({
  message,
  index,
  isOwnMessage,
  onEditMessage,
  onDeleteMessage,
  onSendReaction,
}) => {

// Safely get username
  const username = message.user?.username 
                  || (typeof message.user === "string" ? message.user : "Unknown");

  // Safely get profilePic
  const profilePic = message.user?.profilePic || message.profilePic;


  return (
    <div className={`flex mb-6 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl ${isOwnMessage ? 'ml-auto' : ''}`}>
        {/* Avatar + name */}
        {!isOwnMessage && (
          <div className="flex items-center space-x-2 mb-1">
            {profilePic && (
              <img
                src={profilePic}
                alt="avatar"
                className="w-6 h-6 rounded-full object-cover"
              />
            )}
              <span className="text-xs text-gray-600 font-medium">
                {username} {message.bio && `• ${message.bio}`}
              </span>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            isOwnMessage
              ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-none"
              : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
          }`}
        >
          <p className="break-words">
            {message.text}
            {message.edited && (
              <span className="text-xs italic ml-2 opacity-75">(edited)</span>
            )}
          </p>

          {message.time && (
            <span className={`block text-xs mt-2 ${isOwnMessage ? "text-indigo-200" : "text-gray-500"}`}>
              {message.time}
            </span>
          )}
        </div>

        {/* Edit/Delete buttons */}
        {isOwnMessage && (
          <div className="flex space-x-3 mt-2 justify-end">
            <button
              onClick={() => onEditMessage(message)}
              className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors flex items-center"
            >
              Edit
            </button>
            <button
              onClick={() => onDeleteMessage(message._id || message.id)}
              className="text-xs text-red-600 hover:text-red-800 transition-colors flex items-center"
            >
              Delete
            </button>
          </div>
        )}

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className={`flex space-x-1 mt-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
            {message.reactions.map((r, idx) => (
              <span key={idx} className="text-sm bg-white rounded-full px-2 py-1 shadow-sm border border-gray-100">
                {r}
              </span>
            ))}
          </div>
        )}

        {/* Reaction buttons */}
        <div className={`flex space-x-2 mt-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
          {["👍", "😂", "❤️", "🔥", "🎉"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSendReaction(index, emoji)}
              className="text-sm bg-white rounded-full p-2 shadow-sm hover:shadow-md transition-all hover:scale-110 border border-gray-100 hover:border-indigo-200"
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
