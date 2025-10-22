import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";

const GuestRoutes = ({ children }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            // Redirect based on role
            if (user.role === "admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/admin/dashboard");
            }
        }
    }, [user, navigate]);

    if (user) return null; // Prevent flicker

    return children;
};

export default GuestRoutes;
