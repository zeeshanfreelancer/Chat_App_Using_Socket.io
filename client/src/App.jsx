import { useEffect, useState } from "react";
import io from "socket.io-client";
import "./App.css";
import { getCurrentUser, logout } from "./services/AuthService";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthContainer from "./components/chat/AuthContainer";
import ChatContainer from "./components/chat/ChatContainer";
import PrivateChatContainer from "./components/chat/PrivateChatContainer";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  // query: { username },
});

function App() {
  const [user, setUser] = useState(getCurrentUser());
  const [showLogin, setShowLogin] = useState(true);
  const [showPrivateChat, setShowPrivateChat] = useState(false);

  // Handle logout
  const handleLogout = () => {
    logout();
    setUser(null);
    setShowLogin(true);
  };

  if (!user) {
    return (
      <AuthContainer
        showLogin={showLogin}
        setShowLogin={setShowLogin}
        setUser={setUser}
      />
    );
  }

  return (
    <>
      {showPrivateChat ? (
        <PrivateChatContainer
          user={user}
          socket={socket}
          onBack={() => setShowPrivateChat(false)}
        />
      ) : (
        <ChatContainer
          user={user}
          socket={socket}
          onLogout={handleLogout}
          onPrivateChat={() => setShowPrivateChat(true)}
        />
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
