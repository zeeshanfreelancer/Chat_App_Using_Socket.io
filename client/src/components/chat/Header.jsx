// components/Header.jsx
const Header = ({ user, onLogout, activeChat }) => {
  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex justify-between items-center shadow-md">
      {/* Left Side: App Info */}
      <div className="flex items-center space-x-3">
        {user.profilePic && (
          <img
            src={user.profilePic}
            alt="profile"
            className="w-8 h-8 rounded-full"
          />
        )}
        <div>
          <h2 className="text-xl font-bold">💬 Chat App</h2>
          <p className="text-sm opacity-80">Connected as {user.username}</p>
        </div>
      </div>

      {/* Right Side: Active Chat + Logout */}
      <div className="flex items-center space-x-4">
        {activeChat && (
          <p className="text-sm font-medium text-green-300">
            Chatting with {activeChat}
          </p>
        )}
        <button
          onClick={onLogout}
          className="bg-red-500 px-3 py-1 text-sm rounded hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;
