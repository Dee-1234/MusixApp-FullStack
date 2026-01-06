import axios from "axios";

const API_URL = "http://localhost:8080/api/auth/";

const login = (username, password) => {
    return axios
    .post(API_URL + "login", {
        username,
        password,
    })
    .then((response) => {
        if (response.data.token) {
        localStorage.setItem("user", JSON.stringify(response.data));
        }
        return response.data;
    });
};

const logout = () => {
    localStorage.removeItem("user");
};

const register = (username, email, password, role) => {
    return axios.post(API_URL + "signup", {
    username,
    email,
    password,
    role,
    });
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem("user"));
};

// Fixes the warning by assigning to a variable first
const AuthService = {
    login,
    logout,
    register,
    getCurrentUser,
};

export default AuthService;