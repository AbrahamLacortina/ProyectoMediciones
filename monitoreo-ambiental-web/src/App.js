import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, Toolbar, CssBaseline } from "@mui/material";

import MedicionesTable from "./pages/MedicionesTable";
import Graficos from "./pages/Graficos";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./AuthContext";
import AdminUsuarios from "./pages/AdminUsuarios";
import Inicio from "./pages/Inicio";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import BienvenidaDialog from "./components/BienvenidaDialog";

const MainApp = ({ onLogout, user, showBienvenida, onCloseBienvenida }) => (
    <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <Header />
        <Sidebar user={user} onLogout={onLogout} />

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Toolbar />
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "80vh" }}>
                <Routes>
                    <Route path="/" element={<Inicio />} />
                    <Route path="/mediciones" element={<MedicionesTable />} />
                    <Route path="/graficos" element={<Graficos />} />
                    {user?.rol === 1 && (
                        <Route path="/admin/usuarios/*" element={<AdminUsuarios />} />
                    )}
                </Routes>
            </Box>
        </Box>

        <BienvenidaDialog open={showBienvenida} onClose={onCloseBienvenida} nombre={user?.nombre} />
    </Box>
);

const AppContent = () => {
    const { user, login, logout } = useAuth();
    const [showBienvenida, setShowBienvenida] = useState(false);

    useEffect(() => {
        if (user && !sessionStorage.getItem("bienvenidaMostrada")) {
            setShowBienvenida(true);
            sessionStorage.setItem("bienvenidaMostrada", "1");
        }
    }, [user]);

    if (!user) return <Login onLogin={login} />;

    return (
        <MainApp
            onLogout={logout}
            user={user}
            showBienvenida={showBienvenida}
            onCloseBienvenida={() => setShowBienvenida(false)}
        />
    );
};

const App = () => (
    <AuthProvider>
        <Router>
            <AppContent />
        </Router>
    </AuthProvider>
);

export default App;