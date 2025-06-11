import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    const fetchUser = async () => {
        const res = await fetch("http://localhost:8080/api/auth/me", {
            credentials: "include"
        });
        if (res.ok) {
            const data = await res.json();
            setUser(data);
        } else {
            setUser(null);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = () => fetchUser();
    const logout = async () => {
        await fetch("http://localhost:8080/api/auth/logout", {
            method: "POST",
            credentials: "include"
        });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}