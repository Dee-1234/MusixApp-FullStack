import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";

const Login = () => {
    const navigate = useNavigate();

  // Form States
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleLogin = (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    AuthService.login(username, password).then(
        () => {
        // Redirect to Home and refresh to update Navbar state
        navigate("/home");
        window.location.reload();
        },
        (error) => {
        const resMessage =
            (error.response &&
            error.response.data &&
            error.response.data.message) ||
            error.message ||
            error.toString();

        setLoading(false);
        setMessage(resMessage || "Invalid username or password");
        }
    );
    };

    return (
    <div className="col-md-12">
        <div className="card card-container p-4 shadow-lg mx-auto" style={{ maxWidth: "400px", marginTop: "50px" }}>
        <div className="text-center mb-4">
            <h1 style={{ fontSize: "2.5rem" }}>🎵</h1>
            <h2 className="fw-bold">Welcome Back</h2>
        </div>

        <form onSubmit={handleLogin}>
            <div className="form-group mb-3">
            <label className="mb-1 fw-semibold text-muted small uppercase">Username</label>
            <input
                type="text"
                className="form-control form-control-lg"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            </div>

            <div className="form-group mb-4">
            <label className="mb-1 fw-semibold text-muted small uppercase">Password</label>
            <input
                type="password"
                className="form-control form-control-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            </div>

            <button className="btn btn-success btn-lg w-100 fw-bold" disabled={loading}>
            {loading ? (
                <span className="spinner-border spinner-border-sm"></span>
            ) : (
                "LOG IN"
            )}
            </button>

            {message && (
            <div className="alert alert-danger mt-3 py-2 small text-center" role="alert">
                {message}
            </div>
            )}
        </form>

        <div className="text-center mt-4 border-top pt-3">
            <span className="text-muted small">New to MusixApp? </span>
            <a href="/register" className="text-success small fw-bold text-decoration-none">JOIN NOW</a>
        </div>
        </div>
    </div>
    );
};

export default Login;