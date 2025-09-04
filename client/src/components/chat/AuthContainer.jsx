// components/AuthContainer.jsx
import Login from "../auth/Login";
import Register from "../auth/Register";

const AuthContainer = ({ showLogin, setShowLogin, setUser }) => {
  return showLogin ? (
    <Login
      onLogin={(user) => {
        setUser(user); 
        setShowLogin(true);
      }}
      setShowLogin={setShowLogin}
    />
  ) : (
    <Register
      onRegister={() => {
        setShowLogin(true); // go to login page
      }}
      setShowLogin={setShowLogin}
    />
  );
};


export default AuthContainer;