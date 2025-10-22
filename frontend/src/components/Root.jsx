import React, { useEffect } from 'react'
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

const Root = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (user) {
            if (user.role === "admin") {
                console.log(user.role)
                navigate("/admin/dashboard");
            } else if (user.role === "customer") {
                navigate("/customer/dashboard");
            } else {
                navigate("/login");
            }
        } else {
            navigate("/login");
        }
    }, [user, navigate])
    return null;
}

export default Root