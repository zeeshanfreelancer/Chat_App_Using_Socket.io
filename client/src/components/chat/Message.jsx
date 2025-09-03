const Message = ({ message, index, isOwnMessage }) => {
  // Safely get username
  const username =
    message.user?.username ||
    (typeof message.user === "string" ? message.user : "Unknown");

  // Safely get profilePic
  const profilePic = message.user?.profilePic || message.profilePic || null;

  // Timestamp fallback
  const time = message.time || new Date().toLocaleTimeString();

  return (
    <div
      key={index}
      className={`flex mb-6 ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl ${
          isOwnMessage ? "ml-auto" : ""
        }`}
      >
        {/* Avatar + Name */}
        {!isOwnMessage && (
          <div className="flex items-center space-x-2 mb-1">
            {profilePic && (
              <img
                src={profilePic}
                alt={`${username}'s avatar`}
                className="w-6 h-6 rounded-full object-cover"
              />
            )}
            <span className="text-xs text-gray-600 font-medium">
              {username} {message.bio && `• ${message.bio}`}
            </span>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            isOwnMessage
              ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-none"
              : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
          }`}
        >
          <p className="break-words">{message.text}</p>

          <span
            className={`block text-xs mt-2 ${
              isOwnMessage ? "text-indigo-200" : "text-gray-500"
            }`}
          >
            {time}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Message;
