// components/Header.jsx
const Header = ({ user, onLogout }) => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex justify-between items-center">
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
      <button
        onClick={onLogout}
        className="bg-red-500 px-3 py-1 text-sm rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

export default Header;