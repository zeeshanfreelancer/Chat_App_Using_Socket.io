import { useEffect, useState } from "react";
import "./App.css";
import { getCurrentUser, logout, getSocket, connectSocket } from "./services/AuthService";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthContainer from "./components/chat/AuthContainer";
import ChatContainer from "./components/chat/ChatContainer";

function App() {
  const [user, setUser] = useState(getCurrentUser());
  const [showLogin, setShowLogin] = useState(true);
  const [socket, setSocket] = useState(null);

  // Initialize socket when user is available
  useEffect(() => {
    if (user) {
      // Connect or get the existing socket
      const s = connectSocket(user.username);
      setSocket(s);

      // Only emit joinUser if socket is ready
      if (s && s.connected) {
        s.emit("joinUser", user.username);
      }
    }
  }, [user]);

  // Handle logout
  const handleLogout = () => {
    logout();
    setUser(null);
    setShowLogin(true);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
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

        <ChatContainer
          user={user}
          socket={socket}
          onLogout={handleLogout}

        />

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;