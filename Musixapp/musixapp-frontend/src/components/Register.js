import React, { useState } from "react";
import AuthService from "../services/auth.service";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const navigate = useNavigate();

  // Form States
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user"); // Default role
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    // Backend expects role as an array: ["admin"] or ["user"]
    const rolesArray = [role];

    AuthService.register(username, email, password, rolesArray).then(
        (response) => {
        setMessage("Registration successful! Redirecting to login...");
        setTimeout(() => {
            navigate("/login");
        }, 2000);
        },
        (error) => {
        const resMessage =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();
        setMessage(resMessage);
        setLoading(false);
        }
    );
    };

    return (
    <div className="col-md-12">
        <div className="card card-container p-4 shadow-lg mx-auto" style={{ maxWidth: "450px", marginTop: "50px" }}>
        <div className="text-center mb-4">
            <h2 className="fw-bold">Create Account</h2>
            <p className="text-muted">Join MusixApp today</p>
        </div>

        <form onSubmit={handleRegister}>
            <div className="form-group mb-3">
            <label className="mb-1 fw-semibold">Username</label>
            <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            </div>

            <div className="form-group mb-3">
            <label className="mb-1 fw-semibold">Email</label>
            <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            </div>

            <div className="form-group mb-3">
            <label className="mb-1 fw-semibold">Password</label>
            <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            </div>

            <div className="form-group mb-4">
            <label className="mb-1 fw-semibold">I am a...</label>
            <select 
                className="form-select" 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
            >
                <option value="user">Listener (User)</option>
                <option value="admin">Artist/Manager (Admin)</option>
            </select>
            </div>

            <button className="btn btn-primary w-100 py-2 fw-bold" disabled={loading}>
            {loading ? (
                <span className="spinner-border spinner-border-sm"></span>
            ) : (
                "Sign Up"
            )}
            </button>

            {message && (
            <div className={`alert mt-3 ${message.includes("successful") ? "alert-success" : "alert-danger"}`} role="alert">
                {message}
            </div>
            )}
        </form>
        </div>
    </div>
    );
};

export default Register;