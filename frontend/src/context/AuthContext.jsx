import { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("inv-user");
        return storedUser ? JSON.parse(storedUser) : null;
    })
    const login = (userData, token) => {
        setUser(userData);
        localStorage.setItem("inv-user", JSON.stringify(userData))
        localStorage.setItem("inv-token", token)
    }
    const logout = () => {
        setUser(null);
        localStorage.removeItem("inv-user")
        localStorage.removeItem("inv-token")
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;