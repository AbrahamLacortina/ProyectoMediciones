import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, Toolbar, CssBaseline, ThemeProvider } from "@mui/material";
import getTheme from "./theme";

import MedicionesTable from "./pages/MedicionesTable";
import Graficos from "./pages/Graficos";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./AuthContext";
import AdminUsuarios from "./pages/AdminUsuarios";
import Inicio from "./pages/Inicio";
import AdminCentrales from "./pages/AdminCentrales";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import BienvenidaDialog from "./components/BienvenidaDialog";

function usePrefersDarkMode() {
    const [mode, setMode] = React.useState(() => {
        const saved = localStorage.getItem('colorMode');
        if (saved === 'dark' || saved === 'light') return saved;
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            return "dark";
        }
        return "light";
    });
    React.useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = (e) => {
            if (!localStorage.getItem('colorMode')) setMode(e.matches ? "dark" : "light");
        };
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);
    return [mode, setMode];
}

const MainApp = ({ user, showBienvenida, onCloseBienvenida, mode, setMode }) => (
    <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <Header mode={mode} setMode={setMode} />
        <Sidebar user={user} />

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Toolbar />
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "80vh" }}>
                <Routes>
                    <Route path="/" element={<Inicio />} />
                    <Route path="/mediciones" element={<MedicionesTable />} />
                    <Route path="/graficos" element={<Graficos />} />
                    {user?.rol === 1 && (
                        <>
                            <Route path="/admin/usuarios/*" element={<AdminUsuarios />} />
                            <Route path="/admin/centrales" element={<AdminCentrales />} />
                        </>
                    )}
                </Routes>
            </Box>
        </Box>

        <BienvenidaDialog open={showBienvenida} onClose={onCloseBienvenida} nombre={user?.nombre} />
    </Box>
);

const AppContent = ({ mode, setMode }) => {
    const { user, login } = useAuth();
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
            user={user}
            showBienvenida={showBienvenida}
            onCloseBienvenida={() => setShowBienvenida(false)}
            mode={mode}
            setMode={setMode}
        />
    );
};

const App = () => {
    const [mode, setMode] = usePrefersDarkMode();
    const theme = React.useMemo(() => getTheme(mode), [mode]);
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <AppContent mode={mode} setMode={setMode} />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
