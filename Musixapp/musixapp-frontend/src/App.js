import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Check these paths! If the screen goes white, one of these is wrong.
import AuthService from "./services/auth.service";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";

const App = () => {
  const [currentUser, setCurrentUser] = useState(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const logOut = () => {
    AuthService.logout();
    setCurrentUser(undefined);
    navigate("/login");
  };

  return (
    <div>
      <nav className="navbar navbar-expand navbar-dark bg-dark px-3">
        <Link to={"/"} className="navbar-brand">MusixApp</Link>
        <div className="navbar-nav mr-auto">
          <Link to={"/home"} className="nav-link">Home</Link>
        </div>

        {currentUser ? (
          <div className="navbar-nav ml-auto">
            <li className="nav-item">
              <span className="nav-link">{currentUser.username}</span>
            </li>
            <li className="nav-item">
              <a href="/login" className="nav-link" onClick={logOut}>LogOut</a>
            </li>
          </div>
        ) : (
          <div className="navbar-nav ml-auto">
            <Link to={"/login"} className="nav-link">Login</Link>
            <Link to={"/register"} className="nav-link">Sign Up</Link>
          </div>
        )}
      </nav>

      <div className="container mt-3">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;