export default function OnlineUsersSidebar({ onlineUsers, activeChat, setActiveChat, currentUser }) {
  return (
    <div className="w-1/4 border-r bg-white shadow-md">
      <div className="p-3 font-bold text-lg border-b">Online Users</div>
      {onlineUsers.map((u) => (
        <div
          key={u}
          onClick={() => setActiveChat(u)}
          className={`p-2 cursor-pointer hover:bg-indigo-100 ${
            activeChat === u ? "bg-indigo-200" : ""
          }`}
        >
          {u} {u === currentUser && "(You)"}
        </div>
      ))}
    </div>
  );
}
