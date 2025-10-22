import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

const Logout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Clear user data and token
        logout();
        // Redirect to login
        navigate("/login");
    }, [logout, navigate]);

    return null; // No UI needed, just redirects
};

export default Logout;
