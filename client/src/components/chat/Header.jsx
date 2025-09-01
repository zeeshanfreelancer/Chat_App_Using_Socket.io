// components/Header.jsx
const Header = ({ user, onLogout, onToggleSidebar }) => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center space-x-2">
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
      </div>
      <button
        onClick={onLogout}
        className="bg-red-500 px-3 py-1 text-sm rounded hover:bg-red-600 transition-colors"
      >
        Logout
      </button>
    </div>
  );
};

export default Header;