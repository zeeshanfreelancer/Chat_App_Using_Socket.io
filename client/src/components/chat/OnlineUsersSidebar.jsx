export default function OnlineUsersSidebar({ onlineUsers, activeChat, setActiveChat, currentUser }) {
  return (
    <div className="w-full md:w-80 lg:w-96 h-full bg-white border-r border-gray-200 shadow-lg flex flex-col">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <h2 className="text-2xl font-bold mb-1">Online Users</h2>
        <p className="text-indigo-200 text-sm">
          {onlineUsers.length} user{onlineUsers.length !== 1 ? 's' : ''} online
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-4">
        {onlineUsers.length > 0 ? (
          onlineUsers.map((user) => (
            <div
              key={user}
              onClick={() => setActiveChat(user)}
              className={`p-4 mb-3 cursor-pointer rounded-xl transition-all duration-200 transform hover:scale-105 ${
                activeChat === user
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg border-l-4 border-indigo-400'
                  : 'bg-gray-50 hover:bg-indigo-50 border-l-4 border-transparent hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* User Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {user.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${
                      activeChat === user ? 'text-white' : 'text-gray-800'
                    }`}>
                      {user}
                      {user === currentUser && (
                        <span className="ml-2 text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
                    </p>
                    <p className={`text-sm truncate ${
                      activeChat === user ? 'text-indigo-100' : 'text-gray-500'
                    }`}>
                      {activeChat === user ? 'Active chat' : 'Online now'}
                    </p>
                  </div>
                </div>

                {/* Status Indicator */}
                {activeChat !== user && (
                  <div className="flex flex-col items-end">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-500">Online</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )}
              </div>

              {/* Active Chat Badge */}
              {activeChat === user && (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                    Click to minimize
                  </span>
                  <svg
                    className="w-5 h-5 text-white animate-pulse"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No users online</h3>
            <p className="text-gray-500 text-sm">
              When other users come online, they'll appear here
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Your status: Online</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}